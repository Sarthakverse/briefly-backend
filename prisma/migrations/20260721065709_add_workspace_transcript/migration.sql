-- CreateTable
CREATE TABLE "WorkspaceTranscript" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "transcriptUrl" TEXT,
    "transcriptText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "execSummary" TEXT,
    "execMermaid" TEXT,
    "techSummary" TEXT,
    "techMermaid" TEXT,
    "speakerSummary" TEXT,
    "speakerMermaid" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceTranscript_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkspaceTranscript" ADD CONSTRAINT "WorkspaceTranscript_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
