import { MessageAuthorType, type Chat, type Message } from "generated/prisma";
import { database } from "../database/index.server";
import { createRobotResponse } from "./create-robot-response.server";

export async function createNewChatMessage({
  chat,
  message,
}: {
  chat: Pick<Chat, "user_id" | "name">;
  message: Pick<Message, "text">;
}) {
  const newChat = await database.createChatWithMessage({
    chat,
    message: { text: message.text, author_type: MessageAuthorType.User },
  });

  await createRobotResponse({ chatId: newChat.id, text: message.text });

  return newChat;
}
