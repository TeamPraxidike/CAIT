-- Preserve publications and their files when they are removed from public view.
ALTER TYPE "PublicationEventType" ADD VALUE 'ARCHIVE';
ALTER TYPE "PublicationEventType" ADD VALUE 'RESTORE';

ALTER TABLE "Publication"
ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "archivedById" UUID,
ADD COLUMN "archiveReason" TEXT;

ALTER TABLE "Publication"
ADD CONSTRAINT "Publication_archivedById_fkey"
FOREIGN KEY ("archivedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Publication_archivedAt_idx" ON "Publication"("archivedAt");
