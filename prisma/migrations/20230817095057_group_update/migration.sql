/*
  Warnings:

  - You are about to drop the column `ageRange` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `sex` on the `Group` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT,
    "target" TEXT
);
INSERT INTO "new_Group" ("color", "description", "id", "name") SELECT "color", "description", "id", "name" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
