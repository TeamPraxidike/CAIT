-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "email" SET DEFAULT 'noemail@abv.bg';
