CREATE TYPE "CourseEventType" AS ENUM ('ARCHIVE', 'RESTORE');

ALTER TABLE "Course"
ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "archivedById" UUID,
ADD COLUMN "archiveReason" TEXT;

CREATE TABLE "CourseHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "CourseEventType" NOT NULL,
    "comment" TEXT,
    "userId" UUID,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "CourseHistory_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Course"
ADD CONSTRAINT "Course_archivedById_fkey"
FOREIGN KEY ("archivedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CourseHistory"
ADD CONSTRAINT "CourseHistory_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CourseHistory"
ADD CONSTRAINT "CourseHistory_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "Course"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Course_archivedAt_idx" ON "Course"("archivedAt");
CREATE INDEX "CourseHistory_courseId_createdAt_idx" ON "CourseHistory"("courseId", "createdAt");
