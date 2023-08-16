/*
  Warnings:

  - The primary key for the `Administrator` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Administrator` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Administrator` table. All the data in the column will be lost.
  - Added the required column `auth0id` to the `Administrator` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Administrator" (
    "auth0id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL
);
INSERT INTO "new_Administrator" ("email", "username") SELECT "email", "username" FROM "Administrator";
DROP TABLE "Administrator";
ALTER TABLE "new_Administrator" RENAME TO "Administrator";
CREATE UNIQUE INDEX "Administrator_username_key" ON "Administrator"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
