-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- Preserve all existing administrator access while the legacy isAdmin field
-- remains available for backwards compatibility.
UPDATE "User" SET "role" = 'ADMIN' WHERE "isAdmin" = true;
