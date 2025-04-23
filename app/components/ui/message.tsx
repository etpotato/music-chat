import type { Playlist, Track, Message } from "generated/prisma";
import { cn } from "~/lib/utils";
import { MessageAuthorType } from "~/types/message";
import { Loader } from "./loader";
import { useAuthContext } from "~/context/AuthContext";
import { LoginForm } from "./login-form";
import { AddPlaylistForm } from "./add-playlist-form";
import { getEmbeddedTrackUrl, getPlaylistUrl } from "~/utils/spotify";

export type MessageProps = {
  message: Pick<Message, "id" | "text" | "author_type" | "created_at"> & {
    playlist?: (Playlist & { tracks: Track[] }) | null;
    isLoading?: boolean;
  };
};

export function Message({ message }: MessageProps) {
  const { spotify } = useAuthContext();
  const isUser = message.author_type === MessageAuthorType.User;
  const noPlaylist =
    message.author_type === MessageAuthorType.Robot &&
    !message.isLoading &&
    !message.playlist?.tracks.length;

  return (
    <div
      className={cn("py-2", {
        ["rounded-2xl px-3 border-1 bg-orange-50 border-orange-100"]: isUser,
      })}
    >
      {message.isLoading ? (
        <Loader />
      ) : (
        <>
          <p className="mb-1">{message.text}</p>
          {message.playlist?.description ? (
            <p className="mb-1 mt-2">{message.playlist.description}</p>
          ) : null}
        </>
      )}
      {message.playlist?.tracks.length ? (
        <>
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <p
              className={cn("truncate text-orange-600 italic", {
                ["text-green-600"]: message.playlist.spotify_id,
              })}
            >
              &laquo;{message.playlist.name}&raquo;
            </p>
            {spotify.isAuthenticated ? (
              message.playlist.spotify_id ? (
                <a
                  href={getPlaylistUrl(message.playlist.spotify_id)}
                  rel="noreferrer noopener"
                  target="_blank"
                  className="text-green-600 py-1 px-4 inline-block border-1 border-green-600 rounded-md hover:bg-green-600 hover:text-white"
                >
                  Open in Spotify
                </a>
              ) : (
                <AddPlaylistForm playlistId={message.playlist.id} />
              )
            ) : (
              <LoginForm className="w-fit ml-auto" hasDescription />
            )}
          </div>
          <ul className="grid gap-1 py-2">
            {message.playlist.tracks.map(({ spotify_id }) =>
              spotify_id ? (
                <li key={spotify_id}>
                  <iframe
                    key={spotify_id}
                    src={getEmbeddedTrackUrl(spotify_id)}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                </li>
              ) : null
            )}
          </ul>
        </>
      ) : noPlaylist ? (
        <p className="mb-1 text-orange-500 text-xs">
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
