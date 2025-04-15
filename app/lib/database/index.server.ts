import {
  PrismaClient,
  type User,
  type Chat,
  type Message,
  type Track,
  type Playlist,
} from "../../../generated/prisma";
import prisma from "./prisma.server";

class Database {
  constructor(private readonly client: PrismaClient) {}

  public async getUserById(id: User["id"]) {
    return this.client.user.findFirst({ where: { id } });
  }

  public async createUser({ user_agent }: Pick<User, "user_agent">) {
    const created = await this.client.user.create({
      data: { user_agent },
    });

    return created;
  }

  public async createChatWithMessage({
    chat,
    message,
  }: {
    chat: Pick<Chat, "user_id" | "name">;
    message: Pick<Message, "text" | "author_type">;
  }) {
    const createdChat = await this.client.chat.create({
      data: {
        user_id: chat.user_id,
        name: chat.name,
        messages: {
          create: {
            text: message.text,
            author_type: message.author_type,
          },
        },
      },
    });

    return createdChat;
  }

  public async getUserChats(user_id: string) {
    const chats = await this.client.chat.findMany({
      where: { user_id },
      orderBy: { created_at: "desc" },
    });

    return chats;
  }

  public async createMessage(
    message: Pick<Message, "chat_id" | "text" | "author_type">
  ) {
    const created = await this.client.message.create({
      data: { ...message },
    });

    return created;
  }

  public async createMessageWithPlaylist({
    message,
    playlist,
    tracks,
  }: {
    message: Pick<Message, "chat_id" | "text" | "author_type">;
    playlist: Pick<Playlist, "name" | "description">;
    tracks: Pick<Track, "name" | "author" | "album" | "release_date">[];
  }) {
    const created = await this.client.message.create({
      data: {
        ...message,
        playlist: {
          create: {
            ...playlist,
            tracks: {
              create: tracks,
            },
          },
        },
      },
    });

    return created;
  }

  public async getMessages(chat_id: string) {
    const messages = await this.client.message.findMany({
      where: { chat_id },
      include: {
        playlist: {
          include: {
            tracks: {
              where: { spotify_id: { not: null } },
              take: 5,
            },
          },
        },
      },
    });

    return messages;
  }
}

export const database = new Database(prisma);
