export function getSpotifyBasicAuthToken(
  clientId: string,
  clientSecret: string
) {
  return (
    "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64")
  );
}
