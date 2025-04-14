import { getRecommendedPlaylist } from "~/lib/gen-ai/index.server";
import { data, Link, redirect, useFetcher } from "react-router";
import { database } from "~/lib/database/index.server";
import { spotifyService } from "~/lib/spotify/index.server";
import type { Route } from "./+types/chat";
import { StatusCodes } from "http-status-codes";
import { MessageAuthorType, type Track } from "generated/prisma";

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
  const prompt = formData.get("prompt");

  // TODO: add validation
  if (!prompt || typeof prompt !== "string") {
    throw data(
      { error: "prompt is required" },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  await database.createMessage({
    chat_id: chatId,
    text: prompt,
    author_type: MessageAuthorType.User,
  });

  const playlist = await getRecommendedPlaylist(prompt);

  if (!playlist) {
    await database.createMessage({
      chat_id: chatId,
      text: "Could not generate playlist. Please try again",
      author_type: MessageAuthorType.Robot,
    });

    return;
  }

  playlist.tracks = await Promise.all(
    playlist.tracks.map(async (track) => {
      const spotifyTrack = await spotifyService.getTrack(track);

      if (spotifyTrack) {
        track.spotify_id = spotifyTrack.id;
      }

      return track;
    })
  );

  await database.createMessageWithPlaylist({
    message: {
      chat_id: chatId,
      text: playlist.description,
      author_type: MessageAuthorType.Robot,
    },
    playlist: {
      name: playlist.name,
      description: playlist.description,
    },
    tracks: playlist.tracks as unknown as Pick<
      Track,
      "name" | "author" | "album" | "release_date" | "spotify_id"
    >[],
  });
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
