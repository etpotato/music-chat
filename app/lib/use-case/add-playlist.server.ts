import { data } from "react-router";
import { isValidSpotifyToken } from "./is-valid-spotify-token.server";
import { StatusCodes } from "http-status-codes";
import { database } from "../database/index.server";
import { getUserFromSession } from "./get-user-from-session.server";
import type { UserSession } from "../sessions/user-session.server";
import { SpotifyUserService } from "../spotify/spotify-user-service.server";

export async function addPlaylist(
  playlistId: string | null,
  session: UserSession
) {
  const [user, playlist] = await Promise.all([
    getUserFromSession(session),
    database.getPlaylistById(playlistId),
  ]);

  if (!playlist) {
    throw data("Playlist not found", { status: StatusCodes.NOT_FOUND });
  }

  if (!isValidSpotifyToken(user?.spotify_cred)) {
    throw data("Spotify token is invalid", {
      status: StatusCodes.UNAUTHORIZED,
    });
  }

  const spotifyUserService = new SpotifyUserService(user.spotify_cred, user.id);
  const createdPlaylistId = await spotifyUserService.createPlaylist(playlist);

  await database.updatePlaylistById(playlist.id, {
    spotify_id: createdPlaylistId,
  });

  return createdPlaylistId;
}
