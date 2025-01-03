/*
  Warnings:

  - You are about to drop the column `s3_url` on the `photos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "photos" DROP COLUMN "s3_url",
ADD COLUMN     "url" TEXT NOT NULL DEFAULT '';
