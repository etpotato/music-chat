import type { AccessToken } from "@spotify/web-api-ts-sdk";
import type { SpotifyCred } from "generated/prisma";

export function isValidSpotifyToken(
  token?: Partial<Omit<SpotifyCred, "expires">> | null
): token is AccessToken {
  return Boolean(
    token?.token_type &&
      token.access_token &&
      token.expires_in &&
      token.refresh_token
  );
}
