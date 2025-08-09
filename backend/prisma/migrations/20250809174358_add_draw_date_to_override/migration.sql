/*
  Warnings:

  - Added the column `drawDate` to the `Override` table without a default value.

*/
-- AlterTable
ALTER TABLE "Override" ADD COLUMN "drawDate" TIMESTAMP(3);
UPDATE "Override" SET "drawDate" = NOW() WHERE "drawDate" IS NULL;
ALTER TABLE "Override" ALTER COLUMN "drawDate" SET NOT NULL;
