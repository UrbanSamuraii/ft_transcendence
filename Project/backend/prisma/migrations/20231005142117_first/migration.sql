/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `users` table. All the data in the column will be lost.
  - Made the column `accessToken` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "users_accessToken_key";

-- DropIndex
DROP INDEX "users_refreshToken_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "refreshToken",
ADD COLUMN     "isRegistered" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "accessToken" SET NOT NULL,
ALTER COLUMN "accessToken" SET DEFAULT 'noToken';
