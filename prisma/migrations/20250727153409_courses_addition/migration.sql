-- CreateEnum
CREATE TYPE "Level" AS ENUM ('Bachelor', 'Master', 'PhD');

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "courseId" INTEGER;

-- CreateTable
CREATE TABLE "Course" (
                          "id" SERIAL NOT NULL,
                          "learningObjectives" TEXT[],
                          "prerequisites" TEXT[],
                          "educationalLevel" "Level" NOT NULL,
                          "courseName" TEXT NOT NULL,

                          CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CourseInstructors" (
                                      "A" INTEGER NOT NULL,
                                      "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseName_key" ON "Course"("courseName");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseInstructors_AB_unique" ON "_CourseInstructors"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseInstructors_B_index" ON "_CourseInstructors"("B");

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseInstructors" ADD CONSTRAINT "_CourseInstructors_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseInstructors" ADD CONSTRAINT "_CourseInstructors_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;