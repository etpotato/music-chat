/*
  Warnings:

  - You are about to drop the `SpotifyPlaylist` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN "spotify_id" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SpotifyPlaylist";
PRAGMA foreign_keys=on;
