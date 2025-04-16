import type { Playlist, Track, Message } from "generated/prisma";
import { cn } from "~/lib/utils";
import { MessageAuthorType } from "~/types/message";
import { Loader } from "./loader";

export type MessageProps = {
  message: Pick<Message, "id" | "text" | "author_type" | "created_at"> & {
    playlist?: (Playlist & { tracks: Track[] }) | null;
    isLoading?: boolean;
  };
};

export function Message({ message }: MessageProps) {
  const isUser = message.author_type === MessageAuthorType.User;
  const noPlaylist =
    message.author_type === MessageAuthorType.Robot &&
    !message.isLoading &&
    !message.playlist?.tracks.length;
  return (
    <div
      className={cn("py-2", {
        ["rounded-2xl px-3 text-accent bg-accent-foreground"]: isUser,
      })}
    >
      <p className="mb-1">{message.isLoading ? <Loader /> : message.text}</p>
      {message.playlist?.tracks.length ? (
        <ul className="grid gap-1 py-2">
          {message.playlist.tracks.map(({ spotify_id }) => (
            <li key={spotify_id}>
              <iframe
                key={spotify_id}
                src={`https://open.spotify.com/embed/track/${spotify_id}?utm_source=generator`}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              ></iframe>
            </li>
          ))}
        </ul>
      ) : noPlaylist ? (
        <p className="mb-1 text-green-500 text-xs">
          Your taste is really special, I couldn’t even find the tracks on
          Spotify! Please try something a bit more accessible
        </p>
      ) : null}
      {message.isLoading ? null : (
        <p className={cn("text-xs opacity-50", { ["text-right"]: isUser })}>
          {message.created_at.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
