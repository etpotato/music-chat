/*
  Warnings:

  - You are about to drop the column `pending_playlist_id` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "spotify_state" TEXT,
    "spotify_code" TEXT,
    "spotify_access_token" TEXT,
    "spotify_refresh_token" TEXT
);
INSERT INTO "new_User" ("created_at", "id", "spotify_access_token", "spotify_code", "spotify_refresh_token", "spotify_state", "user_agent") SELECT "created_at", "id", "spotify_access_token", "spotify_code", "spotify_refresh_token", "spotify_state", "user_agent" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
