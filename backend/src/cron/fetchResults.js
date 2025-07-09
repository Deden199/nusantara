const cron = require('node-cron');
const prisma = require('../config/database');

function generateNumbers() {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 49) + 1).join(',');
}

async function run() {
  const cities = await prisma.lotteryResult.findMany({ distinct: ['city'] });
  const drawDate = new Date();
  for (const c of cities) {
    await prisma.lotteryResult.create({
      data: {
        city: c.city,
        drawDate,
        numbers: generateNumbers(),
      },
    });
  }
  console.log('Draw completed at', drawDate);
}

cron.schedule('0 0 * * *', run); // every midnight

module.exports = { run };
