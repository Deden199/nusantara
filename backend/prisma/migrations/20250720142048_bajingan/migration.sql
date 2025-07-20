/*
  Warnings:

  - You are about to drop the column `numbers` on the `LotteryResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LotteryResult" DROP COLUMN "numbers",
ADD COLUMN     "firstPrize" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "secondPrize" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "thirdPrize" TEXT NOT NULL DEFAULT '';
