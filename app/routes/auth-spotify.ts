import { getSession } from "~/lib/sessions/index.server";
import type { Route } from "./+types/auth-spotify";
import { database } from "~/lib/database/index.server";
import { data, redirect } from "react-router";
import { StatusCodes } from "http-status-codes";
import { spotifyService } from "~/lib/spotify/index.server";

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

  const tokenData = await spotifyService.getUserTokens(
    process.env.SPOTIFY_REDIRECT_URL || "",
    code
  );

  await database.updateSpotifyCredByUserId(user.id, tokenData);

  const lastActiveChatId = session.get("last_active_chat");

  return redirect(lastActiveChatId ? `/chats/${lastActiveChatId}` : "/");
}

export default function AuthError({ loaderData }: Route.ComponentProps) {}
