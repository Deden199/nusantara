/*
  Warnings:

  - Added the required column `drawDate` to the `Override` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Override" ADD COLUMN     "drawDate" TIMESTAMP(3) NOT NULL;
