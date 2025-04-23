import { userSession } from "~/lib/sessions/user-session.server";
import { lastChatSession } from "~/lib/sessions/last-chat-session.server";
import type { Route } from "./+types/auth-spotify";
import { database } from "~/lib/database/index.server";
import { data, redirect } from "react-router";
import { StatusCodes } from "http-status-codes";
import { spotifyService } from "~/lib/spotify/index.server";
import { appConfig } from "~/lib/app-config/index.server";
import { SpotifyUserService } from "~/lib/spotify/spotify-user-service.server";

export async function loader({ request }: Route.LoaderArgs) {
  const uSession = await userSession.getSession(request.headers.get("Cookie"));
  const chatSession = await lastChatSession.getSession(
    request.headers.get("Cookie")
  );

  const userId = uSession.get("user_id");

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

  const spotifyUserService = new SpotifyUserService(tokenData, userId);
  const { name, avatar } = await spotifyUserService.getUserInfo();

  await database.updateSpotifyCredByUserId(user.id, {
    ...tokenData,
    expires: new Date(Date.now() + tokenData.expires_in * 1000),
    name,
    avatar,
  });

  const lastActiveChatId = chatSession.get("last_active_chat_id");

  return redirect(lastActiveChatId ? `/chats/${lastActiveChatId}` : "/");
}

export default function AuthError({ loaderData }: Route.ComponentProps) {}
