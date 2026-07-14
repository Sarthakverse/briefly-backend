-- CreateTable
CREATE TABLE "Adapter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Adapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adapterId" TEXT NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enhancement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enhancement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "adapterId" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "enhancementId" TEXT NOT NULL,
    "transcriptUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sharepointSyncStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Adapter_name_key" ON "Adapter"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Release_name_adapterId_key" ON "Release"("name", "adapterId");

-- CreateIndex
CREATE UNIQUE INDEX "Enhancement_name_releaseId_key" ON "Enhancement"("name", "releaseId");

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_adapterId_fkey" FOREIGN KEY ("adapterId") REFERENCES "Adapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enhancement" ADD CONSTRAINT "Enhancement_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_adapterId_fkey" FOREIGN KEY ("adapterId") REFERENCES "Adapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_enhancementId_fkey" FOREIGN KEY ("enhancementId") REFERENCES "Enhancement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
