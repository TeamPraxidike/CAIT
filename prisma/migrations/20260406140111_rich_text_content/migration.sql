/*
  Warnings:

  - The `comment` column on the `PublicationHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `content` on the `Comment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `content` on the `Reply` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "PublicationHistory" DROP COLUMN "comment",
ADD COLUMN     "comment" JSONB;

-- AlterTable
ALTER TABLE "Reply" DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;
