import { Form, Link, Outlet, redirect } from "react-router";
import { nanoid } from "nanoid";
import { database } from "~/lib/database/index.server";
import { commitSession, getSession } from "~/lib/sessions/index.server";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Music caht session" },
    { name: "description", content: "Welcome to the chat!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  let userId = session.get("userId");
  const newChatId = nanoid();

  if (!userId) {
    userId = nanoid();
    session.set("userId", userId);
    await database.set(userId, []);
  }

  const existingChatIds = (await database.get<string[]>(userId)) || [];
  await database.set(userId, [...existingChatIds, newChatId]);
  await database.set(newChatId, []);

  return redirect(`/chats/${newChatId}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const userId = session.get("userId");
  if (!userId) {
    return { chatIds: [] };
  }

  const chatIds = (await database.get<string[]>(userId)) || [];

  return { chatIds };
}

export default function Home({ actionData, loaderData }: Route.ComponentProps) {
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
