-- CreateTable
CREATE TABLE "FileURL" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "materialId" INTEGER NOT NULL,

    CONSTRAINT "FileURL_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FileURL" ADD CONSTRAINT "FileURL_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;
