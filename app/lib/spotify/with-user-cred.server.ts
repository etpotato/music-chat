import { SpotifyApi, type AccessToken } from "@spotify/web-api-ts-sdk";

export class SpotifyWithUserCred {
  private readonly client: SpotifyApi;
  constructor(
    private readonly clientId: string,
    private readonly spotifyCred: AccessToken
  ) {
    this.client = SpotifyApi.withAccessToken(this.clientId, this.spotifyCred);
  }

  public async getUserInfo() {
    return this.client.currentUser.profile();
  }

  public async getCurrentToken() {
    return this.client.getAccessToken();
  }
}
