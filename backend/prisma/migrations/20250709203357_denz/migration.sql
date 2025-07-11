-- CreateTable
CREATE TABLE "LotteryResult" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "drawDate" TIMESTAMP(3) NOT NULL,
    "numbers" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LotteryResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LotteryResult_city_drawDate_key" ON "LotteryResult"("city", "drawDate");
