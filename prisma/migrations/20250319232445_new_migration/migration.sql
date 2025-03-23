-- Create vector extension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('video', 'lectureNotes', 'slides', 'assignment', 'examQuestions', 'other');

-- CreateEnum
CREATE TYPE "PublicationType" AS ENUM ('Material', 'Circuit');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "username" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL DEFAULT 'noemail@abv.bg',
    "emailVerified" TIMESTAMP(3),
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "password" TEXT,
    "aboutMe" TEXT NOT NULL DEFAULT '',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationUsedInCourse" (
    "userId" UUID NOT NULL,
    "publicationId" INTEGER NOT NULL,
    "course" TEXT NOT NULL,

    CONSTRAINT "PublicationUsedInCourse_pkey" PRIMARY KEY ("publicationId","course")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "learningObjectives" TEXT[],
    "prerequisites" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publisherId" UUID NOT NULL,
    "type" "PublicationType" NOT NULL,
    "savedByAllTime" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimilarContent" (
    "similarFromId" INTEGER NOT NULL,
    "similarToId" INTEGER NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SimilarContent_pkey" PRIMARY KEY ("similarFromId","similarToId")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" SERIAL NOT NULL,
    "copyright" TEXT NOT NULL,
    "encapsulatingType" "MaterialType" NOT NULL,
    "timeEstimate" INTEGER,
    "theoryPractice" DOUBLE PRECISION,
    "publicationId" INTEGER NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "path" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT,
    "userId" UUID,
    "publicationId" INTEGER,
    "materialId" INTEGER,

    CONSTRAINT "File_pkey" PRIMARY KEY ("path")
);

-- CreateTable
CREATE TABLE "FileChunk" (
    "id" BIGSERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "embedding" vector(384),
    "filePath" TEXT NOT NULL,

    CONSTRAINT "FileChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Circuit" (
    "id" SERIAL NOT NULL,
    "numNodes" INTEGER NOT NULL DEFAULT 0,
    "publicationId" INTEGER NOT NULL,

    CONSTRAINT "Circuit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "circuitId" INTEGER NOT NULL,
    "extensions" TEXT[],
    "publicationId" INTEGER NOT NULL,
    "posX" INTEGER NOT NULL,
    "posY" INTEGER NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("circuitId","publicationId")
);

-- CreateTable
CREATE TABLE "Edge" (
    "circuitId" INTEGER NOT NULL,
    "fromPublicationId" INTEGER NOT NULL,
    "toPublicationId" INTEGER NOT NULL,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("circuitId","fromPublicationId","toPublicationId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "content" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("content")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "publicationId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reply" (
    "id" SERIAL NOT NULL,
    "commentId" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_maintainers" (
    "A" INTEGER NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_PublicationToTag" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_saved" (
    "A" INTEGER NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_liked" (
    "A" INTEGER NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_reported" (
    "A" INTEGER NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_likedComments" (
    "A" INTEGER NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_likedReplies" (
    "A" INTEGER NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Material_publicationId_key" ON "Material"("publicationId");

-- CreateIndex
CREATE UNIQUE INDEX "File_userId_key" ON "File"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "File_publicationId_key" ON "File"("publicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Circuit_publicationId_key" ON "Circuit"("publicationId");

-- CreateIndex
CREATE UNIQUE INDEX "_maintainers_AB_unique" ON "_maintainers"("A", "B");

-- CreateIndex
CREATE INDEX "_maintainers_B_index" ON "_maintainers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PublicationToTag_AB_unique" ON "_PublicationToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_PublicationToTag_B_index" ON "_PublicationToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_saved_AB_unique" ON "_saved"("A", "B");

-- CreateIndex
CREATE INDEX "_saved_B_index" ON "_saved"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_liked_AB_unique" ON "_liked"("A", "B");

-- CreateIndex
CREATE INDEX "_liked_B_index" ON "_liked"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_reported_AB_unique" ON "_reported"("A", "B");

-- CreateIndex
CREATE INDEX "_reported_B_index" ON "_reported"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_likedComments_AB_unique" ON "_likedComments"("A", "B");

-- CreateIndex
CREATE INDEX "_likedComments_B_index" ON "_likedComments"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_likedReplies_AB_unique" ON "_likedReplies"("A", "B");

-- CreateIndex
CREATE INDEX "_likedReplies_B_index" ON "_likedReplies"("B");

-- AddForeignKey
ALTER TABLE "PublicationUsedInCourse" ADD CONSTRAINT "PublicationUsedInCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationUsedInCourse" ADD CONSTRAINT "PublicationUsedInCourse_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimilarContent" ADD CONSTRAINT "SimilarContent_similarFromId_fkey" FOREIGN KEY ("similarFromId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimilarContent" ADD CONSTRAINT "SimilarContent_similarToId_fkey" FOREIGN KEY ("similarToId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileChunk" ADD CONSTRAINT "FileChunk_filePath_fkey" FOREIGN KEY ("filePath") REFERENCES "File"("path") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Circuit" ADD CONSTRAINT "Circuit_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "Circuit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_circuitId_fromPublicationId_fkey" FOREIGN KEY ("circuitId", "fromPublicationId") REFERENCES "Node"("circuitId", "publicationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_circuitId_toPublicationId_fkey" FOREIGN KEY ("circuitId", "toPublicationId") REFERENCES "Node"("circuitId", "publicationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_maintainers" ADD CONSTRAINT "_maintainers_A_fkey" FOREIGN KEY ("A") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_maintainers" ADD CONSTRAINT "_maintainers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublicationToTag" ADD CONSTRAINT "_PublicationToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PublicationToTag" ADD CONSTRAINT "_PublicationToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("content") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_saved" ADD CONSTRAINT "_saved_A_fkey" FOREIGN KEY ("A") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_saved" ADD CONSTRAINT "_saved_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_liked" ADD CONSTRAINT "_liked_A_fkey" FOREIGN KEY ("A") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_liked" ADD CONSTRAINT "_liked_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_reported" ADD CONSTRAINT "_reported_A_fkey" FOREIGN KEY ("A") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_reported" ADD CONSTRAINT "_reported_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likedComments" ADD CONSTRAINT "_likedComments_A_fkey" FOREIGN KEY ("A") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likedComments" ADD CONSTRAINT "_likedComments_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likedReplies" ADD CONSTRAINT "_likedReplies_A_fkey" FOREIGN KEY ("A") REFERENCES "Reply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likedReplies" ADD CONSTRAINT "_likedReplies_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create index for metadata->>'extension'
CREATE INDEX IF NOT EXISTS metadata_extension_idx
ON public."FileChunk" ((metadata->>'extension'));

-- Create HNSW index for the embedding column
CREATE INDEX IF NOT EXISTS filechunk_embedding_index
ON public."FileChunk" USING hnsw (embedding vector_cosine_ops);