-- DropForeignKey
ALTER TABLE "PublicationUsedInCourse" DROP CONSTRAINT "PublicationUsedInCourse_publicationId_fkey";

-- DropForeignKey
ALTER TABLE "PublicationUsedInCourse" DROP CONSTRAINT "PublicationUsedInCourse_userId_fkey";

-- DropTable
DROP TABLE "PublicationUsedInCourse";
