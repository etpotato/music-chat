import { data, Outlet, redirect, useLocation, useParams } from "react-router";
import { database } from "~/lib/database/index.server";
import { commitSession, getSession } from "~/lib/sessions/index.server";
import type { SpotifyAuth } from "~/types/auth";
import { spotifyService } from "~/lib/spotify/index.server";
import { StatusCodes } from "http-status-codes";
import { FormId } from "~/const";
import type { Route } from "./+types";
import { AuthProvider } from "~/context/AuthContext";
import { AppLayout } from "~/components/ui/app-layout";
import { appConfig } from "~/lib/app-config/index.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Music chat" },
    { name: "description", content: "Welcome to the chat!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const formId = formData.get("id");

  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user_id");

  if (!userId) {
    throw data("User not found", { status: StatusCodes.NOT_FOUND });
  }

  const user = await database.getUserById(userId);

  if (!user) {
    throw data("User not found", { status: StatusCodes.NOT_FOUND });
  }

  if (formId === FormId.LoginSpotify) {
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

  if (formId === FormId.LogoutSpotify) {
    await database.deleteSpotifyCredByUserId(user.id);
    return;
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  let userId = session.get("user_id");
  const user = userId ? await database.getUserById(userId) : null;
  const spotify: SpotifyAuth = {
    isAuthenticated:
      Boolean(user?.spotify_cred?.access_token) &&
      Boolean(
        user?.spotify_cred?.expires_in &&
          user?.spotify_cred?.expires_in < Date.now()
      ),
    name: user?.spotify_cred?.name || undefined,
    avatar: user?.spotify_cred?.avatar || undefined,
  };

  if (!user) {
    const newUser = await database.createUser({
      user_agent: request.headers.get("user-agent"),
    });
    session.set("user_id", newUser.id);
    userId = newUser.id;
  }

  const chats = userId ? await database.getUserChats(userId) : [];

  return data(
    { chats, auth: { spotify } },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { chats, auth } = loaderData;
  const params = useParams();
  const location = useLocation();
  const activeChatId = location.pathname.startsWith("/chats/")
    ? params.id
    : undefined;

  return (
    <AuthProvider data={auth}>
      <AppLayout chats={chats} activeChatId={activeChatId}>
        <Outlet />
      </AppLayout>
    </AuthProvider>
  );
}
