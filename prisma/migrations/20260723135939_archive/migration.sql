-- AlterTable
ALTER TABLE "_CourseInstructors" ADD CONSTRAINT "_CourseInstructors_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CourseInstructors_AB_unique";

-- AlterTable
ALTER TABLE "_PublicationToTag" ADD CONSTRAINT "_PublicationToTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PublicationToTag_AB_unique";

-- AlterTable
ALTER TABLE "_liked" ADD CONSTRAINT "_liked_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_liked_AB_unique";

-- AlterTable
ALTER TABLE "_likedComments" ADD CONSTRAINT "_likedComments_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_likedComments_AB_unique";

-- AlterTable
ALTER TABLE "_likedReplies" ADD CONSTRAINT "_likedReplies_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_likedReplies_AB_unique";

-- AlterTable
ALTER TABLE "_maintainers" ADD CONSTRAINT "_maintainers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_maintainers_AB_unique";

-- AlterTable
ALTER TABLE "_reported" ADD CONSTRAINT "_reported_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_reported_AB_unique";

-- AlterTable
ALTER TABLE "_saved" ADD CONSTRAINT "_saved_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_saved_AB_unique";
