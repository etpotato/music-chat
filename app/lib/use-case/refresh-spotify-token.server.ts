import type { SpotifyCred, User } from "generated/prisma";

export function refreshSpotifyToken(
  user: User & { spotify_cred: SpotifyCred | null }
) {
  if (!user.spotify_cred) {
    return;
  }

  if (
    user.spotify_cred.token_type &&
    user.spotify_cred.access_token &&
    user.spotify_cred.expires_in
  ) {
    const expiresAt = new Date(user.spotify_cred.expires_in);
    if (expiresAt > new Date()) {
      return;
    }
  }
}
