const prisma = require('../config/database');
const { logFetchError } = require('../controllers/lottery.controller');
const { startLiveDraw } = require('../liveDraw');

// lead time in minutes before draw when live draw should start
const LIVE_DRAW_LEAD_MINUTES = 5;

// track cities that have an active live draw to avoid duplicates
const activeLiveDraws = new Set();

function jakartaNow() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 3600000);
}

function generateNumber() {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
}

async function run() {
  try {
    const now = jakartaNow();
    let schedules = [];
    try {
      schedules = await prisma.schedule.findMany();
    } catch (err) {
      console.warn('[run] prisma.schedule.findMany failed:', err);
    }
    for (const s of schedules) {
      if (!s.drawTime) continue;
      const [hour, minute] = s.drawTime.split(':').map(Number);
      const drawDate = new Date(now);
      drawDate.setHours(hour, minute, 0, 0);
      if (drawDate > now) drawDate.setDate(drawDate.getDate() - 1);
      const existing = await prisma.lotteryResult.findUnique({
        where: { city_drawDate: { city: s.city, drawDate } },
      });
      if (now >= drawDate) {
        if (!existing) {
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
        // end live draw once the result is processed
        activeLiveDraws.delete(s.city);
      }
    }
    console.log('Draw job executed at', now);
  } catch (err) {
    console.error('[run] Error executing draw job:', err);
    if (typeof logFetchError === 'function') {
      try {
        await logFetchError('run', err.message);
      } catch (e) {
        console.error('[run] logFetchError failed:', e);
      }
    }
  }
}

async function scheduleNext() {
  try {
    const now = jakartaNow();
    let schedules = [];
    try {
      schedules = await prisma.schedule.findMany();
    } catch (err) {
      console.warn('[scheduleNext] prisma.schedule.findMany failed:', err);
    }
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
      try {
        await run();
      } catch (err) {
        console.error('[scheduleNext] run() failed:', err);
        if (typeof logFetchError === 'function') {
          try {
            await logFetchError('run', err.message);
          } catch (e) {
            console.error('[scheduleNext] logFetchError failed:', e);
          }
        }
      }
      scheduleNext();
    }, delay);
  } catch (err) {
    console.error('[scheduleNext] Error scheduling next job:', err);
    if (typeof logFetchError === 'function') {
      try {
        await logFetchError('schedule', err.message);
      } catch (e) {
        console.error('[scheduleNext] logFetchError failed:', e);
      }
    }
    setTimeout(scheduleNext, 60 * 1000);
  }
}

async function scheduleLiveStart() {
  try {
    const now = jakartaNow();
    let schedules = [];
    try {
      schedules = await prisma.schedule.findMany();
    } catch (err) {
      console.warn('[scheduleLiveStart] prisma.schedule.findMany failed:', err);
    }
    let nextStart = null;
    for (const s of schedules) {
      if (!s.drawTime) continue;
      const [hour, minute] = s.drawTime.split(':').map(Number);
      const drawDate = new Date(now);
      drawDate.setHours(hour, minute, 0, 0);
      if (drawDate <= now) drawDate.setDate(drawDate.getDate() + 1);
      const startTime = new Date(drawDate.getTime() - LIVE_DRAW_LEAD_MINUTES * 60000);
      if (now >= startTime && now < drawDate) {
        if (!activeLiveDraws.has(s.city)) {
          try {
            await startLiveDraw(s.city);
            activeLiveDraws.add(s.city);
          } catch (err) {
            console.error('[scheduleLiveStart] startLiveDraw failed:', err);
          }
        }
      }
      if (startTime > now && (!nextStart || startTime < nextStart)) {
        nextStart = startTime;
      }
    }
    const delay = nextStart ? nextStart.getTime() - now.getTime() : 60 * 1000;
    setTimeout(scheduleLiveStart, delay);
  } catch (err) {
    console.error('[scheduleLiveStart] Error scheduling live draw:', err);
    setTimeout(scheduleLiveStart, 60 * 1000);
  }
}

if (require.main === module) {
  scheduleNext();
  scheduleLiveStart();
}

module.exports = { run, scheduleNext, scheduleLiveStart };

