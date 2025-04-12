import { SpotifyApi, type Track } from "@spotify/web-api-ts-sdk";
import type { Suggestion } from "~/types/suggestion";

export class SpotifyService {
  private readonly client: SpotifyApi;

  constructor() {
    const clientId = process.env.SPOTIFY_CLIENT_ID as string;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET as string;

    if (!clientId || !clientSecret) {
      throw new Error("Spotify client ID and secret are required");
    }

    this.client = SpotifyApi.withClientCredentials(clientId, clientSecret);
  }

  public async getTrack({
    name,
    author,
    date,
    album,
  }: Suggestion): Promise<Track | undefined> {
    const result = await this.client.search(
      `${name} artist:${author} year:${date} album:${album}`,
      ["track"],
      undefined,
      1
    );

    return result.tracks?.items[0];
  }
}

export const spotifyService = new SpotifyService();
