-- First alter the column type by casting enum -> text
ALTER TABLE "Course"
ALTER COLUMN "educationalLevel" TYPE TEXT
USING "educationalLevel"::TEXT;

-- Then drop the enum type
DROP TYPE "Level";
