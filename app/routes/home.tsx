import { data, Outlet, useLocation, useParams } from "react-router";
import { database } from "~/lib/database/index.server";
import { commitSession, getSession } from "~/lib/sessions/index.server";
import type { Route } from "./+types/home";
import { AppLayout } from "~/components/ui/app-layout";
import { AuthProvider } from "~/context/AuthContext";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Music chat" },
    { name: "description", content: "Welcome to the chat!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  let userId = session.get("user_id");
  const user = userId ? await database.getUserById(userId) : null;
  const spotifyAuth = Boolean(user?.spotify_cred?.refresh_token);

  if (!user) {
    const newUser = await database.createUser({
      user_agent: request.headers.get("user-agent"),
    });
    session.set("user_id", newUser.id);
    userId = newUser.id;
  }

  const chats = userId ? await database.getUserChats(userId) : [];

  return data(
    { chats, auth: { spotifyAuth } },
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
