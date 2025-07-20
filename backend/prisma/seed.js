const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const cities = ['Jakarta', 'Surabaya', 'Medan', 'Bali', 'Makassar'];
  const drawDate = new Date();
  for (const city of cities) {
    await prisma.lotteryResult.create({
      data: { city, drawDate, numbers: '' },
    });
        await prisma.schedule.create({
      data: { city, nextDraw: drawDate },
    });
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
