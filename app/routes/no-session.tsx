import { data, redirect, useFetcher } from "react-router";
import { database } from "~/lib/database/index.server";
import { commitSession, getSession } from "~/lib/sessions/index.server";
import type { Route } from "./+types/no-session";
import { InputWithButton } from "~/components/ui/input-with-button";
import { StatusCodes } from "http-status-codes";
import { Loader } from "~/components/ui/loader";
import type { FormEvent } from "react";

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

  const newChat = await database.createChat({ user_id: userId, name: text });

  return redirect(`/chats/${newChat.id}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function NoSession() {
  const fetcher = useFetcher();
  const isLoading = fetcher.state !== "idle";

  function handleSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    sessionStorage.setItem("prompt", formData.get("prompt") as string);
    fetcher.submit(formData, { method: "POST" });
  }

  return (
    <>
      <fetcher.Form method="POST" onSubmit={handleSubmit}>
        <div className="max-w-2/3 mx-auto">
          {isLoading ? (
            <Loader size="lg" className="mx-auto" />
          ) : (
            <InputWithButton name="prompt" />
          )}
        </div>
      </fetcher.Form>
    </>
  );
}
