
import { GoogleGenAI } from "@google/genai";

export const analyzeSafetyImage = async (base64Image: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: "이 건설 현장 사진에서 안전 규정 위반이나 위험 요소를 찾아주세요. 한국어로 요약해줘." }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "AI 분석을 수행할 수 없습니다.";
  }
};
