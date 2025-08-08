const prisma = require('../config/database');

function jakartaNow() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 3600000);
}

function generateNumber() {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
}

async function run() {
  const now = jakartaNow();
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
    if (!existing && now >= drawDate) {
      await prisma.lotteryResult.create({
        data: {
          city: s.city,
          drawDate,
          firstPrize: generateNumber(),
          secondPrize: generateNumber(),
          thirdPrize: generateNumber(),
        },
      });
    }
  }
  console.log('Draw job executed at', now);
}

async function scheduleNext() {
  const now = jakartaNow();
  const schedules = await prisma.schedule.findMany();
  let nextDraw = null;
  for (const s of schedules) {
    if (!s.drawTime) continue;
    const [hour, minute] = s.drawTime.split(':').map(Number);
    const candidate = new Date(now);
    candidate.setHours(hour, minute, 0, 0);
    if (candidate <= now) candidate.setDate(candidate.getDate() + 1);
    if (!nextDraw || candidate < nextDraw) nextDraw = candidate;
  }
  const delay = nextDraw ? nextDraw.getTime() - now.getTime() : 60 * 1000;
  setTimeout(async () => {
    await run();
    scheduleNext();
  }, delay);
}

if (require.main === module) {
  scheduleNext();
}

module.exports = { run, scheduleNext };

