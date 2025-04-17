/*
  Warnings:

  - You are about to drop the column `image` on the `SpotifyCred` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SpotifyCred" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "state" TEXT NOT NULL,
    "code" TEXT,
    "scope" TEXT,
    "token_type" TEXT,
    "access_token" TEXT,
    "expires_in" INTEGER,
    "refresh_token" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "user_id" TEXT NOT NULL,
    "creaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpotifyCred_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SpotifyCred" ("access_token", "code", "creaded_at", "expires_in", "id", "name", "refresh_token", "scope", "state", "token_type", "updated_at", "user_id") SELECT "access_token", "code", "creaded_at", "expires_in", "id", "name", "refresh_token", "scope", "state", "token_type", "updated_at", "user_id" FROM "SpotifyCred";
DROP TABLE "SpotifyCred";
ALTER TABLE "new_SpotifyCred" RENAME TO "SpotifyCred";
CREATE UNIQUE INDEX "SpotifyCred_user_id_key" ON "SpotifyCred"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
