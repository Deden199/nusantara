/*
  Warnings:

  - You are about to drop the column `nextDraw` on the `Schedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "nextDraw",
ADD COLUMN     "drawTime" TEXT NOT NULL DEFAULT '00:00';
