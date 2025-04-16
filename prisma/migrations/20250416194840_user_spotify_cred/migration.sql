/*
  Warnings:

  - You are about to drop the column `spotify_access_token` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `spotify_code` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `spotify_refresh_token` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `spotify_state` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "SpotifyCred" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "state" TEXT NOT NULL,
    "code" TEXT,
    "access_token" TEXT,
    "expires_in" INTEGER,
    "refresh_token" TEXT,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "SpotifyCred_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("created_at", "id", "user_agent") SELECT "created_at", "id", "user_agent" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyCred_user_id_key" ON "SpotifyCred"("user_id");
