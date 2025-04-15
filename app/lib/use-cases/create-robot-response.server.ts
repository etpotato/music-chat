import { MessageAuthorType, type Chat, type Message } from "generated/prisma";
import { database } from "../database/index.server";
import { getRecommendedPlaylist } from "../gen-ai/index.server";
import { spotifyService } from "../spotify/index.server";

export async function createRobotResponse({
  chatId,
  text,
}: {
  chatId: Chat["id"];
  text: Message["text"];
}) {
  const playlist = await getRecommendedPlaylist(text);

  if (!playlist) {
    await database.createMessage({
      chat_id: chatId,
      text: "Could not generate playlist. Please try again",
      author_type: MessageAuthorType.Robot,
    });

    return;
  }

  playlist.tracks = await Promise.all(
    playlist.tracks.map(async (track) => {
      const spotifyTrack = await spotifyService.getTrack(track);

      if (spotifyTrack) {
        track.spotify_id = spotifyTrack.id;
      }

      return track;
    })
  );

  await database.createMessageWithPlaylist({
    message: {
      chat_id: chatId,
      text: playlist.description,
      author_type: MessageAuthorType.Robot,
    },
    playlist: {
      name: playlist.name,
      description: playlist.description,
    },
    tracks: playlist.tracks,
  });
}
