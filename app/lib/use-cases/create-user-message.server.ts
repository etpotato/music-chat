import { MessageAuthorType, type Chat, type Message } from "generated/prisma";
import { database } from "../database/index.server";
import { getRecommendedPlaylist } from "../gen-ai/index.server";
import { spotifyService } from "../spotify/index.server";
import { createRobotResponse } from "./create-robot-response.server";

export async function createUserMessage({
  chatId,
  text,
}: {
  chatId: Chat["id"];
  text: Message["text"];
}) {
  await database.createMessage({
    chat_id: chatId,
    text,
    author_type: MessageAuthorType.User,
  });

  await createRobotResponse({ chatId, text });
}
