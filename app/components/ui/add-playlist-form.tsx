import { useFetcher } from "react-router";
import { FormId } from "~/const";
import { Button } from "./button";
import { useEffect } from "react";

export type AddPlaylistFromProps = {
  playlistId: string;
};

export function AddPlaylistForm({ playlistId }: AddPlaylistFromProps) {
  const fetcher = useFetcher<{ playlistSpotifyId?: string }>();
  const isLoading = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.data?.playlistSpotifyId) {
      window.open(
        `https://open.spotify.com/playlist/${fetcher.data.playlistSpotifyId}`,
        "_blank"
      );
    }
  }, [fetcher.data]);

  return (
    <fetcher.Form method="POST" className="max-w-fit">
      <>
        <input name="id" defaultValue={FormId.AddPlaylist} hidden />
        <input name="playlist_id" defaultValue={playlistId} hidden />
        <Button type="submit" disabled={isLoading}>
          Add playlist
        </Button>
      </>
    </fetcher.Form>
  );
}
