import { database } from "~/lib/database/index.server";
import type { ChatHistory } from "~/lib/gen-ai/index.server";

export async function getChatHistory(chatId: string): Promise<ChatHistory> {
  const { userMessages, generatedMessages } = await database.getChatHistory(
    chatId
  );

  const chatHistory: ChatHistory = [
    ...(userMessages?.map((message) => ({
      text: message.text,
      role: "user",
      created_at: message.created_at,
    })) || []),
    ...(generatedMessages?.map((message) => ({
      text: message.text,
      role: "model",
      created_at: message.created_at,
    })) || []),
  ]
    .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
    .map((message) => ({
      role: message.role,
      parts: [{ text: message.text }],
    }));

  return chatHistory;
}
