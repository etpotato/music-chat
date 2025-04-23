import { redirect, type Session } from "react-router";
import { appConfig } from "../app-config/index.server";
import { database } from "../database/index.server";
import { spotifyService } from "../spotify/index.server";
import { commitSession } from "../sessions/user-session.server";

export async function loginSpotify(userId: string, session: Session) {
  const { url, state } = spotifyService.getAuthUrl(
    appConfig.SPOTIFY_REDIRECT_URL
  );
  await database.createOrUpdateSpotifyCredForUser(userId, { state });

  return redirect(url, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}
