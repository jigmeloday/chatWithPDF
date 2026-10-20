-- AlterTable
ALTER TABLE "File" ADD COLUMN     "keyPoints" JSONB,
ADD COLUMN     "suggestions" JSONB,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "usedOcr" BOOLEAN NOT NULL DEFAULT false;
