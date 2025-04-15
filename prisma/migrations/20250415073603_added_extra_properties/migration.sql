-- AlterTable
ALTER TABLE "AudioLecture" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'processing',
ADD COLUMN     "style" TEXT,
ADD COLUMN     "voice" TEXT NOT NULL DEFAULT 'alloy';
