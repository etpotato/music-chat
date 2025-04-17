import {
  MessageAuthorType,
  type Chat,
  type Message,
  type Track,
} from "generated/prisma";
import { database } from "../../lib/database/index.server";
import {
  getRecommendedPlaylist,
  type RecommendedPlaylist,
} from "../../lib/gen-ai/index.server";
import { spotifyService } from "../../lib/spotify/index.server";

const TARGET_TRACK_NUMBER = 5;
const MAX_ATTEMPTS = 3;

export async function createRobotResponse({
  chatId,
  text,
}: {
  chatId: Chat["id"];
  text: Message["text"];
}) {
  let foundTracksCount = 0;
  let attempts = 0;
  const tracks: Track[] = [];
  let playlist: RecommendedPlaylist | null = null;

  while (foundTracksCount < TARGET_TRACK_NUMBER && attempts < MAX_ATTEMPTS) {
    playlist = await getRecommendedPlaylist(text);

    if (!playlist) {
      await database.createMessage({
        chat_id: chatId,
        text: "Could not generate playlist. Please try again",
        author_type: MessageAuthorType.Robot,
      });

      return;
    }

    const newTracks = await Promise.all(
      playlist.tracks.map(async (track) => {
        const spotifyTrack = await spotifyService.getTrack(track);
        const spotify_id = spotifyTrack?.id || null;

        if (spotify_id) {
          foundTracksCount++;
        }

        return { ...track, spotify_id: spotifyTrack?.id || null };
      })
    );

    tracks.push(...newTracks);
    attempts++;
  }

  const finalPlaylist = playlist as RecommendedPlaylist;

  await database.createMessageWithPlaylist({
    message: {
      chat_id: chatId,
      text: finalPlaylist.description,
      author_type: MessageAuthorType.Robot,
    },
    playlist: {
      name: finalPlaylist.name,
      description: finalPlaylist.description,
    },
    tracks,
  });
}
