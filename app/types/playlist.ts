import type { Track } from "./track";

export type Playlist = {
  name: string;
  description: string;
  tracks: Track[];
};
