import { data, Form, Link, Outlet, redirect } from "react-router";
import { database } from "~/lib/database/index.server";
import { commitSession, getSession } from "~/lib/sessions/index.server";
import type { Route } from "./+types/home";
import { StatusCodes } from "http-status-codes";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Music caht session" },
    { name: "description", content: "Welcome to the chat!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  let userId = session.get("user_id");

  if (!userId) {
    const newUser = await database.createUser({
      user_agent: request.headers.get("user-agent"),
    });
    session.set("user_id", newUser.id);
    userId = newUser.id;
  }

  const newChat = await database.createChat({ user_id: userId });

  return redirect(`/chats/${newChat.id}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const userId = session.get("user_id");

  if (!userId) {
    return { chatIds: [] };
  }

  const chats = await database.getUserChats(userId);
  const chatIds = chats.map((chat) => chat.id);
  return { chatIds };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { chatIds } = loaderData;

  return (
    <>
      <Form method="POST" className="p-4">
        <button type="submit" className="border-2 p-2 cursor-pointer">
          Create new session
        </button>
      </Form>
      <section>
        <h1>Chats</h1>
        <ul>
          {chatIds.map((chatId) => (
            <li key={chatId}>
              <Link to={`/chats/${chatId}`}>{chatId}</Link>
            </li>
          ))}
        </ul>
        <Outlet />
      </section>
    </>
  );
}
