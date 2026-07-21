-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "execMermaid" TEXT,
ADD COLUMN     "execSummary" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "speakerMermaid" TEXT,
ADD COLUMN     "speakerSummary" TEXT,
ADD COLUMN     "techMermaid" TEXT,
ADD COLUMN     "techSummary" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshTokenHash" TEXT;
