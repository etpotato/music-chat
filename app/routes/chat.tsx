import { data, redirect, useFetcher } from "react-router";
import { database } from "~/lib/database/index.server";
import type { Route } from "./+types/chat";
import { StatusCodes } from "http-status-codes";
import { TextareaWithButton } from "~/components/ui/textarea-with-button";
import { createUserMessage } from "~/lib/use-cases/create-user-message.server";

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

  return (
    <>
      <fetcher.Form method="POST">
        <TextareaWithButton name="prompt" loading={isLoading} />
      </fetcher.Form>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <p>{message.text || ""}</p>
            {message.playlist?.tracks?.map(({ spotify_id }) => (
              <iframe
                key={spotify_id}
                src={`https://open.spotify.com/embed/track/${spotify_id}?utm_source=generator`}
                width="100%"
                // height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              ></iframe>
            ))}
          </li>
        ))}
      </ul>
      {isLoading ? <p>Loading...</p> : null}
    </>
  );
}
