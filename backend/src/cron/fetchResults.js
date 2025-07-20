const cron = require('node-cron');
const prisma = require('../config/database');

function generateNumbers() {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 49) + 1).join(',');
}

async function run() {
  const now = new Date();
  const schedules = await prisma.schedule.findMany();
  for (const s of schedules) {
    if (s.nextDraw <= now) {
      await prisma.lotteryResult.create({
        data: {
          city: s.city,
          drawDate: s.nextDraw,
          numbers: generateNumbers(),
        },
      });
      const next = new Date(s.nextDraw.getTime() + 24 * 60 * 60 * 1000);
      await prisma.schedule.update({ where: { city: s.city }, data: { nextDraw: next } });
    }
  }
  console.log('Draw job executed at', now);
}

cron.schedule('0 0 * * *', run); // every midnight

module.exports = { run };
