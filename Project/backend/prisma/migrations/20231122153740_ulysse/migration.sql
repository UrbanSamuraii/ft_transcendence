-- CreateEnum
CREATE TYPE "status_t" AS ENUM ('ONLINE', 'OFFLINE', 'PLAYING');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "id42" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "img_url" VARCHAR(255),
    "hash" TEXT NOT NULL DEFAULT 'noTokenBecause42Identification',
    "accessToken" TEXT NOT NULL DEFAULT 'noToken',
    "isRegistered" BOOLEAN NOT NULL DEFAULT false,
    "is_two_factor_activate" BOOLEAN DEFAULT false,
    "two_factor_secret" TEXT,
    "status" "status_t" DEFAULT 'OFFLINE',
    "eloRating" INTEGER NOT NULL DEFAULT 1000,
    "totalGamesWon" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER NOT NULL,
    "winnerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "message" TEXT,
    "authorName" TEXT NOT NULL,
    "conversation_id" INTEGER NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_member" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_admin" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_banned" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_muted" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id42_key" ON "users"("id42");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_email_username_key" ON "users"("id", "email", "username");

-- CreateIndex
CREATE UNIQUE INDEX "games_uniqueId_key" ON "games"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_name_key" ON "conversations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_id_name_key" ON "conversations"("id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "_member_AB_unique" ON "_member"("A", "B");

-- CreateIndex
CREATE INDEX "_member_B_index" ON "_member"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_admin_AB_unique" ON "_admin"("A", "B");

-- CreateIndex
CREATE INDEX "_admin_B_index" ON "_admin"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_banned_AB_unique" ON "_banned"("A", "B");

-- CreateIndex
CREATE INDEX "_banned_B_index" ON "_banned"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_muted_AB_unique" ON "_muted"("A", "B");

-- CreateIndex
CREATE INDEX "_muted_B_index" ON "_muted"("B");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorName_fkey" FOREIGN KEY ("authorName") REFERENCES "users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_member" ADD CONSTRAINT "_member_A_fkey" FOREIGN KEY ("A") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_member" ADD CONSTRAINT "_member_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admin" ADD CONSTRAINT "_admin_A_fkey" FOREIGN KEY ("A") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_admin" ADD CONSTRAINT "_admin_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_banned" ADD CONSTRAINT "_banned_A_fkey" FOREIGN KEY ("A") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_banned" ADD CONSTRAINT "_banned_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_muted" ADD CONSTRAINT "_muted_A_fkey" FOREIGN KEY ("A") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_muted" ADD CONSTRAINT "_muted_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
