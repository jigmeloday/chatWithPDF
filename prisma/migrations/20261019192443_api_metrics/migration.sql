-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "requestCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'app';
