import { useEffect, useRef } from "react";
import { Message, type MessageProps } from "./message";
import { cn } from "~/lib/utils";
import { MessageAuthorType } from "~/types/message";

export type MessageListProps = {
  messages: Array<MessageProps["message"]>;
};

export function MessageList({ messages }: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollContainerRef.current?.scroll({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex flex-col grow overflow-y-auto pr-2 -mr-2"
    >
      <ul className="grid gap-2">
        {messages.map((message) => (
          <li
            key={message.id}
            className={cn("w-[min(90%,60ch)]", {
              ["ml-auto w-fit max-w-[min(90%,60ch)] min-w-[max(30%,20ch)]"]:
                message.author_type === MessageAuthorType.User,
            })}
          >
            <Message message={message} />
          </li>
        ))}
      </ul>
    </div>
  );
}
