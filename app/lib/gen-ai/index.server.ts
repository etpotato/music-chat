import { GoogleGenAI, Type, type Schema } from "@google/genai";
import type { Playlist, Track } from "generated/prisma";
import { appConfig } from "~/lib/app-config/index.server";

const ai = new GoogleGenAI({ apiKey: appConfig.GEMINI_API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "Playlist name, not longer than 30 characters",
      nullable: false,
    },
    description: {
      type: Type.STRING,
      description: "Playlist description",
      nullable: false,
    },
    tracks: {
      type: Type.ARRAY,
      description: "List of songs",
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
          release_date: {
            type: Type.STRING,
            description: "Song release date",
            nullable: false,
          },
        },
        required: ["author", "name", "album", "release_date"],
      },
      nullable: false,
      minItems: "10",
      maxItems: "10",
    },
  },
  required: ["name", "description", "tracks"],
  description: "Playlist schema",
};

export type RecommendedPlaylist = Playlist & { tracks: Track[] };

export async function getRecommendedPlaylist(
  prompt: string
): Promise<RecommendedPlaylist | null> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-lite",
    config: {
      systemInstruction: appConfig.GEN_AI_SYSTEM_INSTRUCTIONS,
      temperature: 2,
      responseMimeType: "application/json",
      responseSchema,
    },
    contents: prompt,
  });

  if (!response.text) {
    return null;
  }

  const parsedResponse = JSON.parse(response.text) as RecommendedPlaylist;

  parsedResponse.tracks = parsedResponse.tracks.map((track) => ({
    ...track,
    release_date: new Date(track.release_date),
  }));

  return parsedResponse;
}
