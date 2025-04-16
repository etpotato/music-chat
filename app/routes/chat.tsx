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
  const text = formData.get("prompt");

  // TODO: add validation
  if (!text || typeof text !== "string") {
    throw data(
      { error: "prompt is required" },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  await createUserMessage({ chatId, text });
}

export async function loader({ params }: Route.LoaderArgs) {
  if (!params.id) {
    return redirect("/");
  }
  const messages = await database.getMessages(params.id);

  if (!messages) {
    return redirect("/");
  }

  return { messages };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { messages } = loaderData;

  const fetcher = useFetcher();
  const isLoading = fetcher.state !== "idle";
  const pendingMessages: MessageListProps["messages"] | null =
    fetcher.formData?.get("prompt")
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

  const optimisticMessages = pendingMessages
    ? [...messages, ...pendingMessages]
    : messages;

  return (
    <>
      <MessageList messages={optimisticMessages} />
      <fetcher.Form method="POST" className="pt-2">
        <InputWithButton name="prompt" loading={isLoading} inline />
      </fetcher.Form>
    </>
  );
}
