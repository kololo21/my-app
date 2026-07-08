import { Type } from "@google/genai";
import { getAiClient } from "./gemini-client";
import { CoachingRequestDto } from "../dto/coaching.dto";

/**
 * Application層: AI貯金コーチング（節約アドバイス・収支予測コメント）のロジック。
 * GEMINI_API_KEY未設定時は、開発・デモ用途としてモック応答を返す。
 */
export const coachingService = {
  async getCoachingAdvice(dto: CoachingRequestDto) {
    const ai = getAiClient();
    const goal = dto.goal as { title?: string; targetAmount?: number; deadline?: string } | undefined;

    if (!ai) {
      return {
        success: true,
        advices: [
          "現在の目標「" + (goal?.title || "貯金") + "」に向けて順調です！",
          "食費が支出の大部分を占めています。外食を週1回減らすだけで、約3,000円の節約につながります。",
          "登録されているサブスクリプションを時々見直し、近年使っていないものは解約を検討しましょう。",
          "NISAの毎月の積立を設定されています。長期分散投資を続けることで、将来安定した資産形成がアシストされます。",
        ],
        forecast:
          "現在の収支ベースが続けば、設定されたの目標金額 " +
          (goal?.targetAmount || "50,000") +
          " 円には、予定されている期日までに【達成可能】と見込まれます。",
      };
    }

    const payloadText = JSON.stringify({
      transactions: dto.transactions?.slice(-30), // send last 30
      subscriptions: dto.subscriptions,
      goal: dto.goal,
      activeMember: dto.activeMember,
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
              description: "個別具体的で、数値やカテゴリーを考慮した親身な節約・やりくりアドバイス 3〜4点",
            },
            forecast: {
              type: Type.STRING,
              description: "今後数ヶ月の収支推移の予測と目標達成のためのマイルストーン・励ましコメント",
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
