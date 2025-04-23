import { data, Outlet, useLocation, useParams } from "react-router";
import { database } from "~/lib/database/index.server";
import { commitSession, getSession } from "~/lib/sessions/user-session.server";
import type { SpotifyAuth } from "~/types/auth";
import { FormId } from "~/const";
import type { Route } from "./+types";
import { AuthProvider } from "~/context/AuthContext";
import { AppLayout } from "~/components/ui/app-layout";
import { loginSpotify } from "~/lib/use-case/login-spotify.server";
import { getOrCreateUserById } from "~/lib/use-case/get-or-create-user-by-id.server";

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

  if (formId === FormId.LoginSpotify) {
    return loginSpotify(session);
  }

  if (formId === FormId.LogoutSpotify) {
    await database.deleteSpotifyCredByUserId(session.get("user_id"));
    return;
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = await getOrCreateUserById(
    session.get("user_id"),
    request.headers.get("user-agent")
  );
  session.set("user_id", user.id);

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

  const chats = (await database.getUserChats(user.id)) || [];

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
