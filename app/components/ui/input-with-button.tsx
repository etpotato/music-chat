import { cn } from "~/lib/utils";
import { Button } from "./button";
import { Input } from "./input";

export type InputWithButtonProps = {
  name: string;
  placeholder: string;
  inline?: boolean;
  loading?: boolean;
};

export function InputWithButton({
  name,
  placeholder,
  inline = false,
  loading = false,
}: InputWithButtonProps) {
  return (
    <div
      className={cn("grid w-full gap-2", { ["grid-cols-[1fr_90px]"]: inline })}
    >
      <Input
        type="text"
        name={name}
        placeholder={loading ? "" : placeholder}
        key={String(loading)}
        disabled={loading}
      />
      <Button disabled={loading} type="submit">
        Send
      </Button>
    </div>
  );
}
