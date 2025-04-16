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
  return (
    <div
      className={cn(
        "rounded-2xl py-2 px-3",
        isUser ? "text-accent bg-accent-foreground" : "border-1 bg-sidebar"
      )}
    >
      <p className="mb-1">{message.isLoading ? <Loader /> : message.text}</p>
      {message.playlist?.tracks.length ? (
        <ul className="grid gap-1 py-2 -mx-1">
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
      ) : null}
      <p className={cn("text-xs opacity-50", { ["text-right"]: isUser })}>
        {message.created_at.toLocaleTimeString()}
      </p>
    </div>
  );
}
