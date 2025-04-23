import { GoogleGenAI, Type, type Content, type Schema } from "@google/genai";
import type { Playlist, Track } from "generated/prisma";
import { appConfig } from "~/lib/app-config/index.server";

const ai = new GoogleGenAI({ apiKey: appConfig.GEMINI_API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    playlist: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "Playlist name, not longer than 20 characters",
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
          minItems: "5",
          maxItems: "5",
        },
      },
      required: ["name", "description", "tracks"],
      description: "Playlist schema",
    },
    message: {
      type: Type.STRING,
      description: "Answer to user message",
      nullable: false,
    },
  },
  required: ["playlist", "message"],
};

export type RecommendedTrack = Pick<
  Track,
  "name" | "author" | "album" | "release_date"
>;
export type RecommendedPlaylist = Pick<Playlist, "name" | "description"> & {
  tracks: RecommendedTrack[];
};
export type GenAiResponse = {
  message: string;
  playlist: RecommendedPlaylist;
};
export type GetRecommendedPlaylistResponse = {
  response: GenAiResponse;
  original: string;
};
export type ChatHistory = Content[];

export async function getRecommendedPlaylist(
  history: ChatHistory
): Promise<GetRecommendedPlaylistResponse | null> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-lite",
    config: {
      systemInstruction: appConfig.GEN_AI_SYSTEM_INSTRUCTIONS,
      temperature: 1,
      responseMimeType: "application/json",
      responseSchema,
    },
    contents: history,
  });

  if (!response.text) {
    return null;
  }

  const parsedResponse = JSON.parse(response.text) as GenAiResponse;

  parsedResponse.playlist.tracks = parsedResponse.playlist.tracks.map(
    (track) => ({
      ...track,
      release_date: new Date(track.release_date),
    })
  );

  return { response: parsedResponse, original: response.text };
}
