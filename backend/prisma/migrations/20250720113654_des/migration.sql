-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "nextDraw" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_city_key" ON "Schedule"("city");
