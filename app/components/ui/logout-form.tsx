import { FormId } from "~/const";
import { Button } from "./button";
import { useFetcher } from "react-router";

export type LogoutFormProps = {
  className?: string;
};

export function LogoutForm({ className }: LogoutFormProps) {
  const fetcher = useFetcher();
  const isLoading = fetcher.state !== "idle";

  return (
    <fetcher.Form method="POST" className={className}>
      <input name="id" defaultValue={FormId.LogoutSpotify} hidden />
      <Button type="submit" disabled={isLoading} variant="outline">
        Logout Spotify
      </Button>
    </fetcher.Form>
  );
}
