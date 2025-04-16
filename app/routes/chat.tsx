import { data, redirect, useFetcher } from "react-router";
import { database } from "~/lib/database/index.server";
import type { Route } from "./+types/chat";
import { StatusCodes } from "http-status-codes";
import { InputWithButton } from "~/components/ui/input-with-button";
import { createUserMessage } from "~/lib/use-cases/create-user-message.server";
import {
  MessageList,
  type MessageListProps,
} from "~/components/ui/message-list";
import { nanoid } from "nanoid";
// got broken js on the client when import from "generated/prisma"
import { MessageAuthorType } from "~/types/message";
import { useEffect, useMemo } from "react";
import { commitSession, getSession } from "~/lib/sessions/index.server";
import { spotifyService } from "~/lib/spotify/index.server";
import { FormId, placeholders } from "~/const";
import { getRandomItem } from "~/utils/array";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ request, params }: Route.ActionArgs) {
  const chatId = params.id;

  if (!chatId) {
    throw data("Chat not found", { status: StatusCodes.NOT_FOUND });
  }

  const formData = await request.formData();
  const formId = formData.get("id");

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

  if (formId === FormId.LoginSpotify) {
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("user_id");

    if (!userId) {
      throw data("User not found", { status: StatusCodes.NOT_FOUND });
    }

    const user = await database.getUserById(userId);

    if (!user) {
      throw data("User not found", { status: StatusCodes.NOT_FOUND });
    }

    const { url, state } = spotifyService.getAuthUrl(
      process.env.SPOTIFY_REDIRECT_URL as string
    );
    await database.createOrUpdateSpotifyCredForUser(userId, { state });

    session.set("last_active_chat", params.id);

    return redirect(url, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (formId === FormId.AddPlaylist) {
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("user_id");

    if (!userId) {
      throw data("User not found", { status: StatusCodes.NOT_FOUND });
    }

    const user = await database.getUserById(userId);

    if (!user) {
      throw data("User not found", { status: StatusCodes.NOT_FOUND });
    }

    const playlistId = formData.get("playlist_id") as string | null;

    if (!playlistId) {
      throw data("Playlist not found", { status: StatusCodes.NOT_FOUND });
    }

    const playlist = await database.getPlaylistById(playlistId);

    if (!playlist) {
      throw data("Playlist not found", { status: StatusCodes.NOT_FOUND });
    }

    if (!user.spotify_cred) {
      // throw data("Playlist not found", { status: StatusCodes.NOT_FOUND });
    }

    console.log("playlist", user.spotify_cred);

    return;
  }
}

export async function loader({ params }: Route.LoaderArgs) {
  if (!params.id) {
    return redirect("/");
  }
  const messages = await database.getMessages(params.id);

  if (!messages) {
    return redirect("/");
  }

  const placeholder = getRandomItem(placeholders);

  return { messages, placeholder };
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
      <fetcher.Form method="POST" className="pt-2">
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
