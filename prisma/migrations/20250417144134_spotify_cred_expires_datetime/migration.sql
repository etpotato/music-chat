/*
  Warnings:

  - You are about to alter the column `expires` on the `SpotifyCred` table. The data in that column could be lost. The data in that column will be cast from `Int` to `DateTime`.

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
    "expires" DATETIME,
    "refresh_token" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "user_id" TEXT NOT NULL,
    "creaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpotifyCred_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SpotifyCred" ("access_token", "avatar", "code", "creaded_at", "expires", "expires_in", "id", "name", "refresh_token", "scope", "state", "token_type", "updated_at", "user_id") SELECT "access_token", "avatar", "code", "creaded_at", "expires", "expires_in", "id", "name", "refresh_token", "scope", "state", "token_type", "updated_at", "user_id" FROM "SpotifyCred";
DROP TABLE "SpotifyCred";
ALTER TABLE "new_SpotifyCred" RENAME TO "SpotifyCred";
CREATE UNIQUE INDEX "SpotifyCred_user_id_key" ON "SpotifyCred"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
