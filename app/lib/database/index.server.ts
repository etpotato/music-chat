import {
  PrismaClient,
  type User,
  type Chat,
  type Message,
  type Track,
  type Playlist,
  Prisma,
  type SpotifyCred,
} from "../../../generated/prisma";
import prisma from "./prisma.server";

class Database {
  constructor(private readonly client: PrismaClient) {}

  public async getUserById(id: User["id"]) {
    return this.client.user.findFirst({
      where: { id },
      include: { spotify_cred: true },
    });
  }

  public async createUser({ user_agent }: Pick<User, "user_agent">) {
    const created = await this.client.user.create({
      data: { user_agent },
    });

    return created;
  }

  public async createChat(chat: Pick<Chat, "user_id" | "name">) {
    const createdChat = await this.client.chat.create({
      data: {
        user_id: chat.user_id,
        name: chat.name,
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

  public async getPlaylistById(id: Playlist["id"]) {
    const playlist = await this.client.playlist.findFirst({ where: { id } });

    return playlist;
  }

  public async createOrUpdateSpotifyCredForUser(
    userId: string,
    { state }: Pick<SpotifyCred, "state">
  ) {
    const existing = await this.client.spotifyCred.findFirst({
      where: { user_id: userId },
    });

    if (existing) {
      const updated = await this.client.spotifyCred.update({
        where: { id: existing.id },
        data: {
          state,
          expires_in: null,
          scope: null,
          token_type: null,
          access_token: null,
          refresh_token: null,
        },
      });

      return updated;
    }

    const created = this.client.spotifyCred.create({
      data: { state, user_id: userId },
    });

    return created;
  }

  public async updateSpotifyCredByUserId(
    userId: string,
    patch: Partial<
      Pick<
        SpotifyCred,
        "code" | "access_token" | "expires_in" | "refresh_token" | "token_type"
      >
    >
  ) {
    const result = this.client.spotifyCred.update({
      where: {
        user_id: userId,
      },
      data: patch,
    });

    return result;
  }
}

export const database = new Database(prisma);
