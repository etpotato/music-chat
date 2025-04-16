import { SpotifyApi, type Track } from "@spotify/web-api-ts-sdk";
import type { Track as SuggestedTrack } from "generated/prisma";
import { randomBytes } from "node:crypto";

export type SpotifyTokenReponse = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
};

export class SpotifyService {
  private readonly client: SpotifyApi;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string
  ) {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("Spotify client ID and secret are required");
    }

    this.client = SpotifyApi.withClientCredentials(
      this.clientId,
      this.clientSecret
    );
  }

  public async getTrack({
    name,
    author,
    release_date,
    album,
  }: SuggestedTrack): Promise<Track | undefined> {
    const result = await this.client.search(
      `${name} artist:${author} year:${release_date.getFullYear()} album:${album}`,
      ["track"],
      undefined,
      1
    );

    return result.tracks?.items[0];
  }

  public getAuthUrl(redirectUrl: string) {
    const state = randomBytes(16).toString("hex");
    const scope = "playlist-modify-public";

    const searchParams = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      scope: scope,
      redirect_uri: redirectUrl,
      state,
    });

    return {
      url: `https://accounts.spotify.com/authorize?${searchParams.toString()}`,
      state,
    };
  }

  public async getUserTokens(redirectUrl: string, code: string) {
    const body = new URLSearchParams({
      code,
      redirect_uri: redirectUrl,
      grant_type: "authorization_code",
    }).toString();

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(this.clientId + ":" + this.clientSecret).toString(
            "base64"
          ),
      },
      body,
    });

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = (await response.json()) as SpotifyTokenReponse;

    return data;
  }
}

export const spotifyService = new SpotifyService(
  process.env.SPOTIFY_CLIENT_ID as string,
  process.env.SPOTIFY_CLIENT_SECRET as string
);
