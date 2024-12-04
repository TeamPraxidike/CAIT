-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET DEFAULT gen_random_uuid();