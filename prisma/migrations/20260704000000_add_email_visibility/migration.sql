-- CreateEnum
CREATE TYPE "EmailVisibility" AS ENUM ('HIDDEN', 'PUBLIC');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVisibility" "EmailVisibility" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "emailVisibilityPrompted" BOOLEAN NOT NULL DEFAULT false;
