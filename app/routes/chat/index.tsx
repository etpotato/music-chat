import { data, redirect, useActionData, useFetcher } from "react-router";
import { database } from "~/lib/database/index.server";
import type { Route } from "./+types/index";
import { StatusCodes } from "http-status-codes";
import { InputWithButton } from "~/components/ui/input-with-button";
import { createUserMessage } from "~/routes/chat/create-user-message.server";
import {
  MessageList,
  type MessageListProps,
} from "~/components/ui/message-list";
import { nanoid } from "nanoid";
// got broken js on the client when import from "generated/prisma"
import { MessageAuthorType } from "~/types/message";
import { useEffect, useMemo } from "react";
import * as userSession from "~/lib/sessions/user-session.server";
import * as lastChatSession from "~/lib/sessions/last-chat-session.server";
import { FormId, placeholders } from "~/const";
import { getRandomItem } from "~/utils/array";
import { loginSpotify } from "~/lib/use-case/login-spotify.server";
import { addPlaylist } from "~/lib/use-case/add-playlist.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Music chat session" },
    { name: "description", content: "Welcome to the chat!" },
  ];
}

export async function action({ request, params }: Route.ActionArgs) {
  const chatId = params.id;

  if (!chatId) {
    throw data("Chat not found", { status: StatusCodes.NOT_FOUND });
  }

  const session = await userSession.getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const formId = formData.get("id");

  if (formId === FormId.LoginSpotify) {
    return loginSpotify(session);
  }

  if (formId === FormId.Message) {
    const text = formData.get("prompt");

    // TODO: add validation
    if (!text || typeof text !== "string") {
      throw data(
        { error: "prompt is required" },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    await createUserMessage({ chatId, text });

    return;
  }

  if (formId === FormId.AddPlaylist) {
    const playlistSpotifyId = await addPlaylist(
      formData.get("playlist_id") as string | null,
      session
    );

    console.log("playlistSpotifyId", playlistSpotifyId);

    return { playlistSpotifyId };
  }
}

export async function loader({ request, params }: Route.LoaderArgs) {
  if (!params.id) {
    return redirect("/");
  }

  const messages = await database.getMessages(params.id);

  if (!messages) {
    return redirect("/");
  }

  const session = await lastChatSession.getSession(
    request.headers.get("Cookie")
  );
  session.set("last_active_chat_id", params.id);

  const placeholder = getRandomItem(placeholders);

  return data(
    { messages, placeholder },
    {
      headers: {
        "Set-Cookie": await lastChatSession.commitSession(session),
      },
    }
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { messages, placeholder } = loaderData;
  const fetcher = useFetcher();

  useEffect(() => {
    const prompt = sessionStorage.getItem("prompt");
    if (prompt) {
      sessionStorage.removeItem("prompt");
      const formData = new FormData();
      formData.set("prompt", prompt);
      formData.set("id", FormId.Message);
      fetcher.submit(formData, { method: "POST" });
    }
  }, []);

  const isLoading = fetcher.state !== "idle";
  const optimisticMessages: MessageListProps["messages"] | null =
    useMemo(() => {
      const pendingMessages = fetcher.formData?.get("prompt")
        ? [
            {
              id: nanoid(),
              created_at: new Date(),
              text: fetcher.formData.get("prompt") as string,
              author_type: MessageAuthorType.User,
            },
            {
              id: nanoid(),
              created_at: new Date(),
              text: "",
              author_type: MessageAuthorType.Robot,
              isLoading: true,
            },
          ]
        : null;

      const result = pendingMessages
        ? [...messages, ...pendingMessages]
        : messages;

      return result;
    }, [messages, fetcher.formData]);

  return (
    <>
      <MessageList messages={optimisticMessages} />
      <fetcher.Form method="POST" className="p-2 pt-2">
        <input name="id" hidden defaultValue={FormId.Message} />
        <InputWithButton
          name="prompt"
          loading={isLoading}
          placeholder={placeholder}
          inline
        />
      </fetcher.Form>
    </>
  );
}
