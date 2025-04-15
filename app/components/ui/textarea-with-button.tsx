import { Button } from "./button";
import { Textarea } from "./textarea";

export type TextareWithButtonProps = {
  name: string;
  loading?: boolean;
};

export function TextareaWithButton({
  name,
  loading = false,
}: TextareWithButtonProps) {
  return (
    <div className="grid w-full gap-2">
      <Textarea
        name={name}
        placeholder="Tell me how you feel"
        key={String(loading)}
      />
      <Button disabled={loading} type="submit">
        Send
      </Button>
    </div>
  );
}
