import { GoogleGenAI, Type } from "@google/genai";
import type { Suggestion } from "~/types/suggestion";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getSuggestions(prompt: string): Promise<Suggestion[]> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-lite",
    config: {
      systemInstruction: process.env.GEN_AI_SYSTEM_INSTRUCTIONS,
      temperature: 2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        description: "List of song suggestions",
        items: {
          type: Type.OBJECT,
          properties: {
            author: {
              type: Type.STRING,
              description: "Song author",
              nullable: false,
            },
            name: {
              type: Type.STRING,
              description: "Song name",
              nullable: false,
            },
            album: {
              type: Type.STRING,
              description: "Song album",
              nullable: false,
            },
            date: {
              type: Type.STRING,
              description: "Song release date",
              nullable: false,
            },
          },
          required: ["author", "name", "album", "date"],
        },
      },
    },
    contents: prompt,
  });

  if (!response.text) {
    return [];
  }

  return JSON.parse(response.text);
}
