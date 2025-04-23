import { type AccessToken } from "@spotify/web-api-ts-sdk";
import type { Playlist, Track } from "generated/prisma";
import { StatusCodes } from "http-status-codes";
import { spotifyService } from "./index.server";
import { database } from "../database/index.server";

type SpotifyUser = {
  id: string;
  display_name: string;
  images: Array<{ url: string }>;
};

type SpotifyPlaylist = {
  id: string;
};

export class SpotifyUserService {
  private authPromise: Promise<void> | null = null;

  constructor(private token: AccessToken, private readonly userId: string) {}

  private async request<T = unknown>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      if (!this.token) {
        await this.auth();
      }

      const response = await fetch(`https://api.spotify.com/v1${url}`, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `${this.token.token_type} ${this.token.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === StatusCodes.UNAUTHORIZED) {
        await this.auth();

        return this.request(url, options);
      }

      return response.json();
    } catch (error) {
      console.log(
        "spotify request error",
        JSON.stringify({ url, options, error }, null, 2)
      );
      throw error;
    }
  }

  private async auth() {
    if (this.authPromise) {
      return this.authPromise;
    }

    try {
      this.authPromise = this.fetchToken();
      await this.authPromise;
    } catch {
      /* empty */
    }

    setTimeout(() => {
      this.authPromise = null;
    }, 0);
  }

  private async fetchToken() {
    try {
      const token = await spotifyService.refreshUserToken(
        this.token.refresh_token
      );

      this.token = token;

      await database.updateSpotifyCredByUserId(this.userId, {
        ...token,
        expires: new Date(Date.now() + token.expires_in * 1000),
      });

      return;
    } catch (error) {
      console.log(
        "spotify refresh token error",
        JSON.stringify({ error }, null, 2)
      );
      throw error;
    }
  }

  public async getUserInfo() {
    try {
      const { display_name, images, id } = await this.request<SpotifyUser>(
        "/me"
      );

      return { name: display_name, avatar: images[0]?.url, id };
    } catch (error) {
      console.log(
        "spotify get user info error",
        JSON.stringify({ error }, null, 2)
      );
      throw error;
    }
  }

  public async createPlaylist(
    playlist: Playlist & { tracks: Array<Track & { spotify_id: string }> }
  ) {
    try {
      const trackUris = playlist.tracks.map(
        (track) => `spotify:track:${track.spotify_id}`
      );
      const { id } = await this.getUserInfo();
      const createdPlaylist = await this.request<SpotifyPlaylist>(
        `/users/${id}/playlists`,
        {
          method: "POST",
          body: JSON.stringify({
            name: `by Pot: ${playlist.name}`,
            description: playlist.description,
            public: true,
          }),
        }
      );

      await this.request(`/playlists/${createdPlaylist.id}/tracks`, {
        method: "POST",
        body: JSON.stringify({
          uris: trackUris,
          position: 0,
        }),
      });

      return createdPlaylist.id;
    } catch (error) {
      console.log(
        "spotify create playlist error",
        JSON.stringify({ error }, null, 2)
      );
      throw error;
    }
  }
}
