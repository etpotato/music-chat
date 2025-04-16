import { useEffect, useRef } from "react";
import { Message, type MessageProps } from "./message";
import { cn } from "~/lib/utils";
import { MessageAuthorType } from "~/types/message";

export type MessageListProps = {
  messages: Array<MessageProps["message"]>;
};

export function MessageList({ messages }: MessageListProps) {
  const lastMessageRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex flex-col grow overflow-y-auto pr-2 -mr-2">
      <ul className="grid gap-4">
        {messages.map((message, index, arr) => (
          <li
            key={message.id}
            className={cn("w-[90%]", {
              ["ml-auto w-fit max-w-[min(90%,60ch)] min-w-[max(30%,20ch)]"]:
                message.author_type === MessageAuthorType.User,
            })}
            ref={index === arr.length - 1 ? lastMessageRef : null}
          >
            <Message message={message} />
          </li>
        ))}
      </ul>
    </div>
  );
}
