/*
  Warnings:

  - A unique constraint covering the columns `[courseId]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `copyright` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "copyright" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "courseId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "File_courseId_key" ON "File"("courseId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
