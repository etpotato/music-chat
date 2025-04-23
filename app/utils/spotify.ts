export function getPlaylistUrl(id: string) {
  return `https://open.spotify.com/playlist/${id}`;
}
export function getEmbeddedTrackUrl(id: string) {
  return `https://open.spotify.com/embed/track/${id}?utm_source=generator`;
}
