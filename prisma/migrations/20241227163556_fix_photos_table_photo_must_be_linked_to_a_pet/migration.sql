/*
  Warnings:

  - Made the column `pet_id` on table `photos` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "photos" DROP CONSTRAINT "photos_pet_id_fkey";

-- AlterTable
ALTER TABLE "photos" ALTER COLUMN "pet_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
