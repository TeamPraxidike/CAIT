/*
  Warnings:

  - You are about to drop the column `savedByAllTime` on the `Publication` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Publication" DROP COLUMN "savedByAllTime";

-- CreateTable
CREATE TABLE "SavedByAllTime" (
    "publicationId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "SavedByAllTime_pkey" PRIMARY KEY ("publicationId","userId")
);

-- AddForeignKey
ALTER TABLE "SavedByAllTime" ADD CONSTRAINT "SavedByAllTime_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedByAllTime" ADD CONSTRAINT "SavedByAllTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
