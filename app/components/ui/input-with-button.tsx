import { cn } from "~/lib/utils";
import { Button } from "./button";
import { Input } from "./input";

export type InputWithButtonProps = {
  name: string;
  inline?: boolean;
  loading?: boolean;
};

export function InputWithButton({
  name,
  inline = false,
  loading = false,
}: InputWithButtonProps) {
  return (
    <div
      className={cn("grid w-full gap-2", { ["grid-cols-[1fr_90px]"]: inline })}
    >
      <Input
        name={name}
        placeholder="Tell me how you feel"
        key={String(loading)}
        disabled={loading}
      />
      <Button disabled={loading} type="submit">
        Send
      </Button>
    </div>
  );
}
