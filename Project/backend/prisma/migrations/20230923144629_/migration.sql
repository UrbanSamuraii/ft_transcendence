/*
  Warnings:

  - A unique constraint covering the columns `[id,email,username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_id_email_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "two_factor_secret" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_id_email_username_key" ON "users"("id", "email", "username");
