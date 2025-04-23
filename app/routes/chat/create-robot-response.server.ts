import {
  MessageAuthorType,
  type Chat,
  type Message,
  type Track,
} from "generated/prisma";
import { database } from "../../lib/database/index.server";
import {
  getRecommendedPlaylist,
  type GenAiResponse,
  type RecommendedTrack,
} from "../../lib/gen-ai/index.server";
import { spotifyService } from "../../lib/spotify/index.server";
import { getChatHistory } from "./get-chat-history.server";

const TARGET_TRACK_NUMBER = 5;
const MAX_ATTEMPTS = 3;

export async function createRobotResponse(chatId: string) {
  let foundTracksCount = 0;
  let attempts = 0;
  const tracks: Array<RecommendedTrack & Partial<Pick<Track, "spotify_id">>> =
    [];
  let response: GenAiResponse | null = null;
  let generatedMessageText: string | null = null;

  const chatHistory = await getChatHistory(chatId);

  while (foundTracksCount < TARGET_TRACK_NUMBER && attempts < MAX_ATTEMPTS) {
    const recommedation = await getRecommendedPlaylist(chatHistory);

    if (!recommedation) {
      await database.createMessage({
        chat_id: chatId,
        text: "Could not generate playlist. Please try again",
        author_type: MessageAuthorType.Robot,
      });

      return;
    }

    response = recommedation.response;
    generatedMessageText = recommedation.original;

    const newTracks = await Promise.all(
      response.playlist.tracks.map(async (track) => {
        const spotifyTrack = await spotifyService.getTrack(track);
        const spotify_id = spotifyTrack?.id || null;

        if (spotify_id) {
          foundTracksCount++;
        }

        return { ...track, spotify_id: spotifyTrack?.id || null };
      })
    );

    for (const newTrack of newTracks) {
      if (tracks.every((track) => track.spotify_id !== newTrack.spotify_id)) {
        tracks.push(newTrack);
      }
    }

    attempts++;
  }

  const finalResponse = response as GenAiResponse;

  await Promise.all([
    database.createMessageWithPlaylist({
      message: {
        chat_id: chatId,
        text: finalResponse.message,
        author_type: MessageAuthorType.Robot,
      },
      playlist: {
        name: finalResponse.playlist.name,
        description: finalResponse.playlist.description,
      },
      tracks,
    }),
    database.createGeneratedMessage({
      chat_id: chatId,
      text: generatedMessageText || "",
    }),
  ]);
}
