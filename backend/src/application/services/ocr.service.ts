import { Type } from "@google/genai";
import { getAiClient } from "./gemini-client";
import { ParseBarcodeDto, ScanReceiptDto } from "../dto/ocr.dto";

/**
 * Application層: レシートOCR・バーコード価格予測のロジック。
 * GEMINI_API_KEY未設定時は、開発・デモ用途としてモック応答を返す。
 */
export const ocrService = {
  async scanReceipt(dto: ScanReceiptDto) {
    const ai = getAiClient();

    if (!ai) {
      return {
        success: true,
        merchantName: dto.textFallback ? `模擬店舗 (${dto.textFallback})` : "サンプルスーパー",
        itemName: dto.textFallback || "レシート商品一括",
        amount: Math.floor(Math.random() * 2000) + 500,
        category: "食費",
        paymentMethod: "現金",
        date: new Date().toISOString().split("T")[0],
        rawItems: [
          { name: "お肉", price: 450 },
          { name: "野菜パック", price: 280 },
          { name: "牛乳", price: 210 },
        ],
      };
    }

    const contents: any[] = [];

    if (dto.image && dto.mimeType) {
      contents.push({
        inlineData: {
          data: dto.image,
          mimeType: dto.mimeType,
        },
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
      text: "レシートを読み取って合計金額、店名/商品名、カテゴリ、支払い方法、日付、個別商品を1つのJSONオブジェクトで返してください。",
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["itemName", "amount", "category", "paymentMethod", "date"],
          properties: {
            itemName: {
              type: Type.STRING,
              description: "店舗名、または代表的な商品名（例: イオン、マツモトキヨシ、カフェなど）",
            },
            amount: {
              type: Type.INTEGER,
              description: "合計支払金額（数値のみ）",
            },
            category: {
              type: Type.STRING,
              description: "食費、日用品、娯楽・交際、光熱費・通信、住宅・家賃、その他のいずれか",
            },
            paymentMethod: {
              type: Type.STRING,
              description: "現金、クレジットカード、電子マネー、QRコード、口座引落のいずれか",
            },
            date: {
              type: Type.STRING,
              description: "レシートに記載された日付 (YYYY-MM-DD)",
            },
            rawItems: {
              type: Type.ARRAY,
              description: "明細品目の一覧",
              items: {
                type: Type.OBJECT,
                required: ["name", "price"],
                properties: {
                  name: { type: Type.STRING, description: "品目名" },
                  price: { type: Type.INTEGER, description: "価格" },
                },
              },
            },
          },
        },
      },
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText.trim());
    return { success: true, ...result };
  },

  async parseBarcode(dto: ParseBarcodeDto) {
    const ai = getAiClient();

    if (!ai) {
      return {
        success: true,
        itemName: `バーコード商品 (JAN: ${dto.barcode})`,
        predictedPrice: 198,
        description:
          "本アプリは模擬モードで動作しています。Gemini APIキーを設定すると、実際のJANバーコードから正確な商品名と日本の小売店舗平均価格をリアルタイムに予測されます。",
      };
    }

    const prompt = `
      日本のJANバーコードまたは商品名に関するデータ: "${dto.barcode}"

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
            itemName: {
              type: Type.STRING,
              description: "正確な商品名またはブランド名",
            },
            predictedPrice: {
              type: Type.INTEGER,
              description: "推定される平均小売価格（円単位）",
            },
            description: {
              type: Type.STRING,
              description: "この商品のプチ紹介、および関連するスマートな節約豆知識アドバイス",
            },
          },
        },
      },
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText.trim());
    return { success: true, ...result };
  },
};
