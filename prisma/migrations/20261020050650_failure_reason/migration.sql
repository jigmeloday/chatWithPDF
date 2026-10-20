-- DropIndex
DROP INDEX "DocumentChunk_embedding_idx";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "failureReason" TEXT;
