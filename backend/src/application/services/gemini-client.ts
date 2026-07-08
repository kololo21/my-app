import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

// APIキー未設定の環境（開発・デモ用途)ではnullを返し、呼び出し側でモック応答にフォールバックする。
export function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn(
        "WARNING: GEMINI_API_KEY environment variable is not set. AI features will fallback to mock data.",
      );
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}
