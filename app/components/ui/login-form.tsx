import { FormId } from "~/const";
import { Button } from "./button";
import { useFetcher } from "react-router";
import { cn } from "~/lib/utils";

export type LoginFormProps = {
  className?: string;
  hasDescription?: boolean;
};

export function LoginForm({ className, hasDescription }: LoginFormProps) {
  const fetcher = useFetcher();
  const isLoading = fetcher.state !== "idle";

  return (
    <fetcher.Form method="POST" className={className}>
      <input name="id" defaultValue={FormId.LoginSpotify} hidden />
      <Button
        type="submit"
        className={cn("block h-10", { ["h-auto"]: hasDescription })}
        disabled={isLoading}
        variant="outline"
      >
        Login Spotify
        {hasDescription ? (
          <span className="block text-[0.8em] opacity-50">
            to add to your playlists
          </span>
        ) : null}
      </Button>
    </fetcher.Form>
  );
}
