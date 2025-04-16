import { cn } from "~/lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { getRandomItem } from "~/utils/array";

export type InputWithButtonProps = {
  name: string;
  inline?: boolean;
  loading?: boolean;
};

const placeholders = [
  "Tell me how you fell",
  "What’s the mood today?",
  "What’s going on in your head?",
  "Tell me what today feels like.",
  "Music for… what exactly?",
  "Give me a feeling to match.",
  "What's the story today?",
  "Set the scene in a sentence.",
  "How do you feel right now?",
  "Got a mood in mind?",
  "What would your movie sound like?",
  "Words first, music later.",
  "Type the mood, get the music.",
  "Describe your moment in words.",
  "What's playing in your imaginary movie?",
  "Is it a chill day or chaos?",
  "Feeling epic or mellow?",
  "Tell me the scene, I’ll score it.",
  "What's the emotion of the hour?",
  "If today had a theme song...",
  "Today sounds like... what?",
  "What's your current genre?",
  "Any thoughts that need a beat?",
  "Name the feeling. I’ll name the tune.",
  "Got a mood that needs a track?",
  "Need a soundtrack for that thought?",
  "What’s in your head? Let’s remix it.",
  "Any ideas begging for a tune?",
];

export function InputWithButton({
  name,
  inline = false,
  loading = false,
}: InputWithButtonProps) {
  const placeholder = loading ? "" : getRandomItem(placeholders);
  return (
    <div
      className={cn("grid w-full gap-2", { ["grid-cols-[1fr_90px]"]: inline })}
    >
      <Input
        name={name}
        placeholder={placeholder}
        key={String(loading)}
        disabled={loading}
      />
      <Button disabled={loading} type="submit">
        Send
      </Button>
    </div>
  );
}
