/*
  Warnings:

  - Added the required column `deleted_at` to the `pets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pets" ADD COLUMN     "deleted_at" TIMESTAMP(3) NOT NULL;
