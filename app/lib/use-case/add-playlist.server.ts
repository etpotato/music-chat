import { data } from "react-router";
import { isValidSpotifyToken } from "./is-valid-spotify-token.server";
import { StatusCodes } from "http-status-codes";
import { appConfig } from "../app-config/index.server";
import { SpotifyWithUserCred } from "../spotify/with-user-cred.server";
import { database } from "../database/index.server";
import { getUserFromSession } from "./get-user-from-session.server";
import type { UserSession } from "../sessions/user-session.server";

export async function addPlaylist(
  playlistId: string | null,
  session: UserSession
) {
  const user = await getUserFromSession(session);

  if (!playlistId) {
    throw data("Playlist not found", { status: StatusCodes.NOT_FOUND });
  }

  const playlist = await database.getPlaylistById(playlistId);

  if (!playlist) {
    throw data("Playlist not found", { status: StatusCodes.NOT_FOUND });
  }

  if (!(user.spotify_cred && isValidSpotifyToken(user.spotify_cred))) {
    throw data("Spotify token is invalid", {
      status: StatusCodes.UNAUTHORIZED,
    });
  }

  const spotifyWithUserCred = new SpotifyWithUserCred(
    appConfig.SPOTIFY_CLIENT_ID,
    user.spotify_cred
  );

  const createdPlaylistId = await spotifyWithUserCred.createPlaylist(playlist);

  await database.updatePlaylistById(playlist.id, {
    spotify_id: createdPlaylistId,
  });
}
