import { redirect } from "react-router";
import { appConfig } from "../app-config/index.server";
import { database } from "../database/index.server";
import { spotifyService } from "../spotify/index.server";
import {
  commitSession,
  type UserSession,
} from "../sessions/user-session.server";
import { getUserFromSession } from "./get-user-from-session.server";

export async function loginSpotify(session: UserSession) {
  const user = await getUserFromSession(session);
  const { url, state } = spotifyService.getAuthUrl(
    appConfig.SPOTIFY_REDIRECT_URL
  );
  await database.createOrUpdateSpotifyCredForUser(user.id, { state });

  return redirect(url, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}
