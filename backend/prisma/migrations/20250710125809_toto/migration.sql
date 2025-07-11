-- AlterTable
ALTER TABLE "LotteryResult" ADD COLUMN     "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Override" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oldNumbers" TEXT NOT NULL,
    "newNumbers" TEXT NOT NULL,
    "adminUsername" TEXT NOT NULL,

    CONSTRAINT "Override_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FetchError" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,

    CONSTRAINT "FetchError_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Override_time_idx" ON "Override"("time");

-- CreateIndex
CREATE INDEX "FetchError_time_idx" ON "FetchError"("time");
