/*
  Warnings:

  - A unique constraint covering the columns `[id,name]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "conversations_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "conversations_id_name_key" ON "conversations"("id", "name");
