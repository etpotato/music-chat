import {
  PrismaClient,
  type User,
  type Chat,
  type Message,
  type Track,
  type Playlist,
  type SpotifyCred,
} from "../../../generated/prisma";
import prisma from "./prisma.server";

class DatabasePrisma {
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
      include: { spotify_cred: true },
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

  public async getPlaylistById(id?: Playlist["id"] | null) {
    if (!id) {
      return null;
    }

    const playlist = await this.client.playlist.findFirst({
      where: { id },
      include: {
        tracks: {
          where: { spotify_id: { not: null } },
          take: 5,
        },
      },
    });

    return playlist as Playlist & {
      tracks: Array<Track & { spotify_id: string }>;
    };
  }

  public async createOrUpdateSpotifyCredForUser(
    userId: string,
    { state }: Pick<SpotifyCred, "state">
  ) {
    const spotifyCred = await this.client.spotifyCred.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        state,
      },
      update: {
        state,
        code: null,
        scope: null,
        token_type: null,
        access_token: null,
        expires_in: null,
        refresh_token: null,
      },
    });

    return spotifyCred;
  }

  public async getSpotifyCredByUserId(userId: string) {
    const spotifyCred = await this.client.spotifyCred.findFirst({
      where: { user_id: userId },
    });

    return spotifyCred;
  }

  public async updateSpotifyCredByUserId(
    userId: string,
    patch: Partial<
      Pick<
        SpotifyCred,
        | "code"
        | "access_token"
        | "expires_in"
        | "expires"
        | "refresh_token"
        | "token_type"
        | "name"
        | "avatar"
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

  public async deleteSpotifyCredByUserId(userId?: string) {
    if (!userId) {
      return;
    }

    await this.client.spotifyCred.delete({ where: { user_id: userId } });
  }

  public async updatePlaylistById(
    id: Playlist["id"],
    patch: Pick<Playlist, "spotify_id">
  ) {
    return this.client.playlist.update({
      where: { id },
      data: patch,
    });
  }
}

export const database = new DatabasePrisma(prisma);
