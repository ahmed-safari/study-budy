/*
  Warnings:

  - Added the required column `status` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "title" DROP NOT NULL;
