import { Outlet, useLocation, useParams } from "react-router";
import { database } from "~/lib/database/index.server";
import { getSession } from "~/lib/sessions/index.server";
import type { Route } from "./+types/home";
import { AppLayout } from "~/components/ui/app-layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Music chat" },
    { name: "description", content: "Welcome to the chat!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const userId = session.get("user_id");

  if (!userId) {
    return { chats: [] };
  }

  const chats = await database.getUserChats(userId);
  return { chats };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { chats } = loaderData;
  const params = useParams();
  const location = useLocation();
  const activeChatId = location.pathname.startsWith("/chats/")
    ? params.id
    : undefined;

  return (
    <>
      <AppLayout chats={chats} activeChatId={activeChatId}>
        <Outlet />
      </AppLayout>
    </>
  );
}
