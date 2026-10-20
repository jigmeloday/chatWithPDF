-- AlterTable
ALTER TABLE "User" ADD COLUMN     "answerLanguage" TEXT NOT NULL DEFAULT 'auto',
ADD COLUMN     "answerStyle" TEXT NOT NULL DEFAULT 'balanced',
ADD COLUMN     "notifyDocFailed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyDocReady" BOOLEAN NOT NULL DEFAULT false;
