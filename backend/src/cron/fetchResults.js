const cron = require('node-cron');
const prisma = require('../config/database');

function generateNumbers() {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 49) + 1).join(',');
}

async function run() {
  const now = new Date();
  const schedules = await prisma.schedule.findMany();
  for (const s of schedules) {
    if (!s.drawTime) continue;
    const [hour, minute] = s.drawTime.split(':').map(Number);
    const drawDate = new Date(now);
    drawDate.setHours(hour, minute, 0, 0);
    if (drawDate > now) drawDate.setDate(drawDate.getDate() - 1);
    const existing = await prisma.lotteryResult.findUnique({
      where: { city_drawDate: { city: s.city, drawDate } },
    });
    if (!existing && now >= drawDate) {      await prisma.lotteryResult.create({
        data: {
          city: s.city,
          drawDate,
          numbers: generateNumbers(),
        },
      });
      const next = new Date(s.nextDraw.getTime() + 24 * 60 * 60 * 1000);
      await prisma.schedule.update({ where: { city: s.city }, data: { nextDraw: next } });
    }
  }
  console.log('Draw job executed at', now);
}

cron.schedule('* * * * *', run); // check every minute

module.exports = { run };
