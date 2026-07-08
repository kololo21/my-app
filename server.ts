import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable large bodies for image uploads (receipt scans)
app.use(express.json({ limit: "20mb" }));

// Initialize GoogleGenAI lazily as per environment guidelines
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features will fallback to mock data.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API: Scan receipt
app.post("/api/scan-receipt", async (req, res) => {
  try {
    const { image, mimeType, textFallback } = req.body;
    const ai = getAiClient();

    if (!ai) {
      // Graceful fallback if API key is missing
      return res.json({
        success: true,
        merchantName: textFallback ? `模擬店舗 (${textFallback})` : "サンプルスーパー",
        itemName: textFallback || "レシート商品一括",
        amount: Math.floor(Math.random() * 2000) + 500,
        category: "食費",
        paymentMethod: "現金",
        date: new Date().toISOString().split("T")[0],
        rawItems: [
          { name: "お肉", price: 450 },
          { name: "野菜パック", price: 280 },
          { name: "牛乳", price: 210 }
        ]
      });
    }

    let contents: any[] = [];

    if (image && mimeType) {
      contents.push({
        inlineData: {
          data: image,
          mimeType: mimeType
        }
      });
    }

    const systemPrompt = `
      あなたはレシートを解析する優秀な会計アシスタントです。
      レシート画像を読み取り、店舗名や主たる購入物品から連想される「商品名（または店舗名）」、「合計金額（JPY、数値のみ）」、「カテゴリ」、「支払い方法」、「レシート内の詳細項目」を抽出してください。
      
      【制約】
      - カテゴリは必ず次のうちから最も適切なものを選択してください: ['食費', '日用品', '娯楽・交際', '光熱費・通信', '住宅・家賃', 'その他']
      - 支払い方法は必ず次のうちから最も適切なものを選択してください: ['現金', 'クレジットカード', '電子マネー', 'QRコード', '口座引落']
      - 日付はレシートに記載された日付（YYYY-MM-DD）を抽出し、見つからない場合は本日の日付（YYYY-MM-DD）にしてください。
    `;

    contents.push({
      text: "レシートを読み取って合計金額、店名/商品名、カテゴリ、支払い方法、日付、個別商品を1つのJSONオブジェクトで返してください。"
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["itemName", "amount", "category", "paymentMethod", "date"],
          properties: {
            itemName: {
              type: Type.STRING,
              description: "店舗名、または代表的な商品名（例: イオン、マツモトキヨシ、カフェなど）"
            },
            amount: {
              type: Type.INTEGER,
              description: "合計支払金額（数値のみ）"
            },
            category: {
              type: Type.STRING,
              description: "食費、日用品、娯楽・交際、光熱費・通信、住宅・家賃、その他のいずれか"
            },
            paymentMethod: {
              type: Type.STRING,
              description: "現金、クレジットカード、電子マネー、QRコード、口座引落のいずれか"
            },
            date: {
              type: Type.STRING,
              description: "レシートに記載された日付 (YYYY-MM-DD)"
            },
            rawItems: {
              type: Type.ARRAY,
              description: "明細品目の一覧",
              items: {
                type: Type.OBJECT,
                required: ["name", "price"],
                properties: {
                  name: { type: Type.STRING, description: "品目名" },
                  price: { type: Type.INTEGER, description: "価格" }
                }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText.trim());
    return res.json({ success: true, ...result });

  } catch (err: any) {
    console.error("Receipt Scan Error:", err);
    return res.status(500).json({
      success: false,
      error: "レシートの解析に失敗しました。時間をおいてもう一度お試しください。"
    });
  }
});

// 2. API: Parse Barcode / Estimate Average Price
app.post("/api/parse-barcode", async (req, res) => {
  try {
    const { barcode } = req.body;
    const ai = getAiClient();

    if (!ai) {
      // Graceful fallback if API key is missing
      return res.json({
        success: true,
        itemName: `バーコード商品 (JAN: ${barcode})`,
        predictedPrice: 198,
        description: "本アプリは模擬モードで動作しています。Gemini APIキーを設定すると、実際のJANバーコードから正確な商品名と日本の小売店舗平均価格をリアルタイムに予測されます。"
      });
    }

    const prompt = `
      日本のJANバーコードまたは商品名に関するデータ: "${barcode}" 
      
      この商品コードまたは商品名に基づいて、以下の情報をJSON形式で予測・出力してください：
      1. 正確な製品名/商品名 (itemName)
      2. 日本国内の一般的な小売店（スーパー・ドラッグストア・コンビニ等）での予測平均価格 (predictedPrice、数値のみ、円単位)
      3. この商品の豆知識や、節約に向けたアドバイス（他社代替品での節約、PB商品の活用など）(description、100文字以内)

      もし全く未知のコードである場合は、一般的なソフトドリンクや日常スナック菓子としての妥当な推定値を返してください。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["itemName", "predictedPrice", "description"],
          properties: {
            itemName: { type: Type.STRING, description: "正確な商品名またはブランド名" },
            predictedPrice: { type: Type.INTEGER, description: "推定される平均小売価格（円単位）" },
            description: { type: Type.STRING, description: "この商品のプチ紹介、および関連するスマートな節約豆知識アドバイス" }
          }
        }
      }
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText.trim());
    return res.json({ success: true, ...result });

  } catch (err) {
    console.error("Barcode API Error:", err);
    return res.status(500).json({
      success: false,
      error: "バーコードの解析に失敗しました。"
    });
  }
});

// 3. API: AI Saving Assist & Kakeibo Coaching
app.post("/api/ai-coaching", async (req, res) => {
  try {
    const { transactions, subscriptions, goal, activeMember } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.json({
        success: true,
        advices: [
          "現在の目標「" + (goal?.title || "貯金") + "」に向けて順調です！",
          "食費が支出の大部分を占めています。外食を週1回減らすだけで、約3,000円の節約につながります。",
          "登録されているサブスクリプションを時々見直し、近年使っていないものは解約を検討しましょう。",
          "NISAの毎月の積立を設定されています。長期分散投資を続けることで、将来安定した資産形成がアシストされます。"
        ],
        forecast: "現在の収支ベースが続けば、設定されたの目標金額 " + (goal?.targetAmount || "50,000") + " 円には、予定されている期日までに【達成可能】と見込まれます。"
      });
    }

    const payloadText = JSON.stringify({
      transactions: transactions?.slice(-30), // send last 30
      subscriptions,
      goal,
      activeMember
    });

    const prompt = `
      あなたは親身になって家族や個人の資産形成をアシストする、プロの家計簿アドバイザー「AI貯金コーチ」です。
      
      以下の家計簿データ（最近の取引、定期サブスク、貯金目標、現在選択されているメンバー）を分析してください：
      ${payloadText}

      このデータを元に、以下の項目を含めた親密かつ実用的なアドバイスを提供してください：
      
      1. 【貯金アシスト・具体的な節約アクション】3〜4つの箇条書きアドバイスの配列 (advices)
         （例：「食費が全体の○%を占めており、特に週末に集中しています。自炊比率を上げると月額〜円浮きます」「カード払いが多いので、スマートフォンの定額通知をおすすめします」「NISA口座への確実な資金移動を優先しましょう」など）
      2. 【収支予測と目標達成可能性のコメント】(forecast)
         （これまでの平均的な収支ペースと、サブスク継続支払い、NISA積立金額を踏まえた、目標（${goal?.title || "貯金"}、目標額: ${goal?.targetAmount || "未設定"}円、期日: ${goal?.deadline || "未設定"}）の達成予測、および今後3ヶ月〜1年の資産推移予測を含む総合メッセージ）

      メッセージは日本語で、応援するような暖かく信頼性の高い口調で作成してください。
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["advices", "forecast"],
          properties: {
            advices: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "個別具体的で、数値やカテゴリーを考慮した親身な節約・やりくりアドバイス 3〜4点"
            },
            forecast: {
              type: Type.STRING,
              description: "今後数ヶ月の収支推移の予測と目標達成のためのマイルストーン・励ましコメント"
            }
          }
        }
      }
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText.trim());
    return res.json({ success: true, ...result });

  } catch (err) {
    console.error("AI Coaching API Error:", err);
    return res.status(500).json({
      success: false,
      error: "AIアドバイスの作成に失敗しました。"
    });
  }
});

// Setup Vite Dev server or asset folder for Express routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Household ledger server running on http://localhost:${PORT}`);
  });
}

startServer();
