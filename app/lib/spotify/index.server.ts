import { SpotifyApi, type Track } from "@spotify/web-api-ts-sdk";
import type { Track as SuggestedTrack } from "generated/prisma";
import { randomBytes } from "node:crypto";
import { getSpotifyBasicAuthToken } from "./utils.server";
import { appConfig } from "~/lib/app-config/index.server";

const SPOTIFY_SCOPE =
  "user-read-email user-read-private playlist-modify-public playlist-modify-private";
const SPOTIFY_AUTH_GRANT_TYPE = "authorization_code";
const SPOTIFY_REFRESH_GRANT_TYPE = "refresh_token";

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

    const searchParams = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      scope: SPOTIFY_SCOPE,
      redirect_uri: redirectUrl,
      state,
    });

    return {
      url: `https://accounts.spotify.com/authorize?${searchParams.toString()}`,
      state,
    };
  }

  public async getUserToken(redirectUrl: string, code: string) {
    // https://developer.spotify.com/documentation/web-api/tutorials/code-flow
    const body = new URLSearchParams({
      code,
      redirect_uri: redirectUrl,
      grant_type: SPOTIFY_AUTH_GRANT_TYPE,
    }).toString();

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: getSpotifyBasicAuthToken(
          this.clientId,
          this.clientSecret
        ),
      },
      body,
    });

    // TODO: handle errors
    if (!response.ok) {
      throw new Error("getUserToken request failed");
    }

    const data = (await response.json()) as SpotifyTokenReponse;

    return data;
  }

  public async refreshUserToken(refreshToken: string) {
    // https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens
    const body = new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: SPOTIFY_REFRESH_GRANT_TYPE,
    }).toString();

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: getSpotifyBasicAuthToken(
          this.clientId,
          this.clientSecret
        ),
      },
      body,
    });

    // TODO: handle errors
    if (!response.ok) {
      throw new Error("refreshUserToken request failed");
    }

    const data = (await response.json()) as SpotifyTokenReponse;

    return data;
  }
}

export const spotifyService = new SpotifyService(
  appConfig.SPOTIFY_CLIENT_ID,
  appConfig.SPOTIFY_CLIENT_SECRET
);
