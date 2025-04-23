import { getSession } from "~/lib/sessions/index.server";
import type { Route } from "./+types/auth-spotify";
import { database } from "~/lib/database/index.server";
import { data, redirect } from "react-router";
import { StatusCodes } from "http-status-codes";
import { spotifyService } from "~/lib/spotify/index.server";
import { SpotifyWithUserCred } from "~/lib/spotify/with-user-cred.server";
import { appConfig } from "~/lib/app-config/index.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user_id");

  if (!userId) {
    return data("User not found", { status: StatusCodes.NOT_FOUND });
  }

  const user = await database.getUserById(userId);

  if (!user) {
    return data("User not found", { status: StatusCodes.NOT_FOUND });
  }

  const url = new URL(request.url);
  const [code, state, error] = [
    url.searchParams.get("code"),
    url.searchParams.get("state"),
    url.searchParams.get("error"),
  ];

  if (!code || user.spotify_cred?.state !== state) {
    return data("Auth failed", { status: StatusCodes.UNAUTHORIZED });
  }

  await database.updateSpotifyCredByUserId(user.id, {
    code,
  });

  const tokenData = await spotifyService.getUserToken(
    appConfig.SPOTIFY_REDIRECT_URL,
    code
  );

  const spotifyWithUserCred = new SpotifyWithUserCred(
    appConfig.SPOTIFY_CLIENT_ID,
    tokenData
  );
  const profile = await spotifyWithUserCred.getUserInfo();

  await database.updateSpotifyCredByUserId(user.id, {
    ...tokenData,
    expires: new Date(Date.now() + tokenData.expires_in * 1000),
    name: profile.display_name,
    avatar: profile.images[0]?.url,
  });

  const lastActiveChatId = session.get("last_active_chat_id");

  return redirect(lastActiveChatId ? `/chats/${lastActiveChatId}` : "/");
}

export default function AuthError({ loaderData }: Route.ComponentProps) {}
