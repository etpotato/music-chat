import { data, redirect, useFetcher } from "react-router";
import { database } from "~/lib/database/index.server";
import { commitSession, getSession } from "~/lib/sessions/index.server";
import type { Route } from "./+types/no-session";
import { TextareaWithButton } from "~/components/ui/textarea-with-button";
import { StatusCodes } from "http-status-codes";
import { createNewChatMessage } from "~/lib/use-cases/create-new-chat-message";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Music caht session" },
    { name: "description", content: "Welcome to the chat!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  let userId = session.get("user_id");

  if (!userId || !(await database.getUserById(userId))) {
    const newUser = await database.createUser({
      user_agent: request.headers.get("user-agent"),
    });
    session.set("user_id", newUser.id);
    userId = newUser.id;
  }

  const formData = await request.formData();
  const text = formData.get("prompt");

  // TODO: add validation
  if (!text || typeof text !== "string") {
    throw data(
      { error: "prompt is required" },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  const newChat = await createNewChatMessage({
    chat: { user_id: userId, name: text },
    message: { text },
  });

  return redirect(`/chats/${newChat.id}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function NoSession() {
  const fetcher = useFetcher();
  const isLoading = fetcher.state !== "idle";

  return (
    <>
      <fetcher.Form method="POST">
        <TextareaWithButton name="prompt" loading={isLoading} />
      </fetcher.Form>
    </>
  );
}
