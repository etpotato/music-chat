import { useFetcher } from "react-router";
import { FormId } from "~/const";
import { Button } from "./button";

export type AddPlaylistFromProps = {
  playlistId: string;
};

export function AddPlaylistForm({ playlistId }: AddPlaylistFromProps) {
  const fetcher = useFetcher();
  const isLoading = fetcher.state !== "idle";

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
