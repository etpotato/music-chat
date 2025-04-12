import { getSuggestions } from "~/lib/gen-ai/index.server";
import { Link, redirect, useFetcher } from "react-router";
import { database } from "~/lib/database/index.server";
import { spotifyService } from "~/lib/spotify/index.server";
import type { Route } from "./+types/chat";
import { nanoid } from "nanoid";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

type Message = {
  id: string;
  text: string;
  tracks?: string[];
};

export async function action({ request, params }: Route.ActionArgs) {
  const chatId = params.id;

  if (!chatId) {
    return { error: "Chat ID is required" };
  }

  const formData = await request.formData();
  const prompt = formData.get("prompt");

  if (!prompt || typeof prompt !== "string") {
    return { error: "Prompt is required" };
  }

  const userMessage: Message = { text: prompt, id: nanoid() };
  await database.set(chatId, [
    ...(await database.get<Message[]>(chatId)),
    userMessage,
  ]);

  console.log("action prompt", prompt);
  const suggestions = await getSuggestions(prompt);

  console.log("action suggestions", suggestions);

  const tracks = (
    await Promise.all(
      suggestions.flatMap(async (suggestion) => {
        const track = await spotifyService.getTrack(suggestion);
        if (track) {
          return [track.id];
        }

        return [];
      })
    )
  )
    .flat()
    .slice(0, 5);

  const robotMessage: Message = {
    id: nanoid(),
    text: "Here are some tracks I found for you",
    tracks,
  };

  await database.set(chatId, [
    ...(await database.get<Message[]>(chatId)),
    robotMessage,
  ]);

  console.log("messages in acition", await database.get(chatId));

  return { ok: true };
}

export async function loader({ params }: Route.LoaderArgs) {
  if (!params.id) {
    return redirect("/");
  }
  const messages = await database.get<Message[] | undefined>(params.id);

  if (!messages) {
    return redirect("/");
  }

  console.log("messages in loader", messages);

  return { messages };
}

export default function Home({ actionData, loaderData }: Route.ComponentProps) {
  const { messages } = loaderData;
  console.log("messages in component", messages);

  const fetcher = useFetcher();
  const isLoading = fetcher.state !== "idle";

  return (
    <>
      <div>
        <Link to="/">Home</Link>
      </div>
      <fetcher.Form method="POST" className="p-4">
        <input
          type="text"
          name="prompt"
          className="border-2 p-2"
          key={fetcher.state}
        />
        <button type="submit" className="border-2 p-2" disabled={isLoading}>
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </fetcher.Form>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <p>{message.text || ""}</p>
            {message.tracks?.map((id) => (
              <iframe
                key={id}
                src={`https://open.spotify.com/embed/track/${id}?utm_source=generator`}
                width="100%"
                height="152"
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
