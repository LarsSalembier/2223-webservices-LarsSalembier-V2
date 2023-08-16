/*
  Warnings:

  - The primary key for the `Administrator` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Administrator" (
    "auth0id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL
);
INSERT INTO "new_Administrator" ("auth0id", "email", "username") SELECT "auth0id", "email", "username" FROM "Administrator";
DROP TABLE "Administrator";
ALTER TABLE "new_Administrator" RENAME TO "Administrator";
CREATE UNIQUE INDEX "Administrator_username_key" ON "Administrator"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
