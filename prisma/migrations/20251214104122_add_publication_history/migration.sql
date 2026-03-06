-- CreateEnum
CREATE TYPE "PublicationEventType" AS ENUM ('CREATE', 'UPDATE');

-- CreateTable
CREATE TABLE "PublicationHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "PublicationEventType" NOT NULL,
    "comment" TEXT,
    "meta" JSONB,
    "userId" UUID,
    "publicationId" INTEGER NOT NULL,

    CONSTRAINT "PublicationHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PublicationHistory" ADD CONSTRAINT "PublicationHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationHistory" ADD CONSTRAINT "PublicationHistory_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
