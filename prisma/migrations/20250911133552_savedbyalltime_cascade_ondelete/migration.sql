-- DropForeignKey
ALTER TABLE "SavedByAllTime" DROP CONSTRAINT "SavedByAllTime_publicationId_fkey";

-- DropForeignKey
ALTER TABLE "SavedByAllTime" DROP CONSTRAINT "SavedByAllTime_userId_fkey";

-- AddForeignKey
ALTER TABLE "SavedByAllTime" ADD CONSTRAINT "SavedByAllTime_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedByAllTime" ADD CONSTRAINT "SavedByAllTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
