/*
  Warnings:

  - A unique constraint covering the columns `[personId,groupId]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Membership_personId_groupId_key" ON "Membership"("personId", "groupId");
