/*
  Warnings:

  - You are about to drop the column `spotify_url` on the `Playlist` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Playlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message_id" TEXT NOT NULL,
    "spotify_id" TEXT,
    CONSTRAINT "Playlist_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Message" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Playlist" ("created_at", "description", "id", "message_id", "name", "updated_at") SELECT "created_at", "description", "id", "message_id", "name", "updated_at" FROM "Playlist";
DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";
CREATE UNIQUE INDEX "Playlist_message_id_key" ON "Playlist"("message_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
