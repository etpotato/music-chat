import type { Playlist, Track, Message } from "generated/prisma";
import { cn } from "~/lib/utils";
import { MessageAuthorType } from "~/types/message";
import { Loader } from "./loader";
import { Button } from "./button";
import { useFetcher } from "react-router";
import { FormId } from "~/const";
import { useAuthContext } from "~/context/AuthContext";

export type MessageProps = {
  message: Pick<Message, "id" | "text" | "author_type" | "created_at"> & {
    playlist?: (Playlist & { tracks: Track[] }) | null;
    isLoading?: boolean;
  };
};

export function Message({ message }: MessageProps) {
  const fetcher = useFetcher();
  const { spotifyAuth } = useAuthContext();
  const isLoading = fetcher.state !== "idle";
  const isUser = message.author_type === MessageAuthorType.User;
  const noPlaylist =
    message.author_type === MessageAuthorType.Robot &&
    !message.isLoading &&
    !message.playlist?.tracks.length;
  return (
    <div
      className={cn("py-2", {
        ["rounded-2xl px-3 border-1 bg-sky-50 border-sky-100"]: isUser,
      })}
    >
      <p className="mb-1">{message.isLoading ? <Loader /> : message.text}</p>
      {message.playlist?.tracks.length ? (
        <>
          <fetcher.Form method="POST" className="max-w-fit ml-auto">
            {spotifyAuth ? (
              <>
                <input name="id" defaultValue={FormId.AddPlaylist} hidden />
                <input
                  name="playlist_id"
                  defaultValue={message.playlist.id}
                  hidden
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="hover:bg-green-800"
                >
                  Add playlist
                </Button>
              </>
            ) : (
              <>
                <input name="id" defaultValue={FormId.LoginSpotify} hidden />
                <Button
                  type="submit"
                  className="block h-auto items-baseline"
                  disabled={isLoading}
                  variant="outline"
                >
                  Login Spotify
                  <span className="block text-[0.8em] opacity-50">
                    to add to your playlists
                  </span>
                </Button>
              </>
            )}
          </fetcher.Form>
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
        </>
      ) : noPlaylist ? (
        <p className="mb-1 text-green-500 text-xs">
          Your taste is really special, I couldn’t even find the tracks on
          Spotify! Please try something a bit more accessible
        </p>
      ) : null}
      {message.isLoading ? null : (
        <p
          className={cn("text-xs opacity-50", {
            ["text-right"]: isUser,
          })}
        >
          {message.created_at.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
