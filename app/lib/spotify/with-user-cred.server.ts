import { SpotifyApi, type AccessToken } from "@spotify/web-api-ts-sdk";
import type { Playlist, Track } from "generated/prisma";

export class SpotifyWithUserCred {
  private readonly client: SpotifyApi;
  constructor(
    private readonly clientId: string,
    private readonly spotifyCred: AccessToken
  ) {
    try {
      this.client = SpotifyApi.withAccessToken(this.clientId, this.spotifyCred);
      console.log("spotify cred", spotifyCred);
    } catch (error) {
      console.log("constructor", error);
      throw error;
    }
  }

  public async getUserInfo() {
    return this.client.currentUser.profile();
  }

  public async getCurrentToken() {
    return this.client.getAccessToken();
  }

  public async createPlaylist(
    playlist: Playlist & { tracks: Array<Track & { spotify_id: string }> }
  ) {
    try {
      const { id } = await this.client.currentUser.profile();
      const createdPlaylist = await this.client.playlists.createPlaylist(id, {
        name: `by Pot: ${playlist.name}`,
        description: playlist.description,
        public: true,
      });

      const trackUris = playlist.tracks.map(
        (track) => `spotify:track:${track.spotify_id}`
      );

      await this.client.playlists.addItemsToPlaylist(
        createdPlaylist.id,
        trackUris,
        0
      );

      return createdPlaylist.id;
    } catch (error) {
      console.log("createPlaylist", error);
      throw error;
    }
  }
}
