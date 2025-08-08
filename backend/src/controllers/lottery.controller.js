const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { getIO } = require('../io');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// track timers for result expiration per city
const resultExpireTimers = new Map();
// track cities that currently have an active live draw
const activeLiveDraws = new Set();

function computeLiveMeta(schedule) {
  const now = jakartaDate();
  let startsAt = null;
  let isLive = false;

  if (schedule && /^\d{2}:\d{2}$/.test(schedule.drawTime)) {
    const [drawHour, drawMinute] = schedule.drawTime.split(':').map(Number);
    const drawDate = new Date(now);
    drawDate.setUTCHours(drawHour - 7, drawMinute, 0, 0);
    if (drawDate <= now) drawDate.setUTCDate(drawDate.getUTCDate() + 1);
    startsAt = drawDate.toISOString();

    if (schedule.closeTime && /^\d{2}:\d{2}$/.test(schedule.closeTime)) {
      const [closeHour, closeMinute] = schedule.closeTime.split(':').map(Number);
      const closeDate = new Date(now);
      closeDate.setUTCHours(closeHour - 7, closeMinute, 0, 0);
      if (closeDate <= now) closeDate.setUTCDate(closeDate.getUTCDate() + 1);
      isLive = now >= closeDate && now < drawDate;
    }
  }

  return { isLive, startsAt };
}

async function emitLiveMeta(city, scheduleOverride) {
  try {
    const schedule =
      scheduleOverride ||
      (await prisma.schedule.findUnique({ where: { city } }));
    const meta = computeLiveMeta(schedule);

    if (!meta.isLive && scheduleOverride) {
      // emit expiration timestamp and re-emit meta after expiry
      meta.resultExpiresAt = Date.now() + 10 * 60 * 1000;
      const existing = resultExpireTimers.get(city);
      if (existing) clearTimeout(existing);
      resultExpireTimers.set(
        city,
        setTimeout(() => {
          resultExpireTimers.delete(city);
          emitLiveMeta(city).catch(() => {});
        }, 10 * 60 * 1000)
      );
    }

    const io = getIO();
    io.to(city).emit('liveMeta', meta);
  } catch (err) {
    try {
      const io = getIO();
      io.to(city).emit('liveMeta', { isLive: false, startsAt: null, resultExpiresAt: null });
    } catch (e) {
      // ignore
    }
  }
}

exports.listPools = async (req, res) => {
  try {
    const cities = await prisma.lotteryResult.findMany({
      distinct: ['city'],
      orderBy: { city: 'asc' },
    });

    const schedules = await prisma.schedule.findMany({
      where: { city: { in: cities.map((c) => c.city) } },
    });
    const scheduleMap = Object.fromEntries(schedules.map((s) => [s.city, s]));

    const now = jakartaDate();
    const enriched = cities.map((c) => {
      const sched = scheduleMap[c.city];
      let startsAt = null;
      let isLive = false;
      if (sched && /^\d{2}:\d{2}$/.test(sched.drawTime)) {
        const [drawHour, drawMinute] = sched.drawTime.split(':').map(Number);
        const [closeHour, closeMinute] = (sched.closeTime || '').split(':').map(Number);

        const drawDate = new Date(now);
        drawDate.setUTCHours(drawHour - 7, drawMinute, 0, 0);
        if (drawDate <= now) drawDate.setUTCDate(drawDate.getUTCDate() + 1);
        startsAt = drawDate.toISOString();

        if (
          !Number.isNaN(closeHour) &&
          !Number.isNaN(closeMinute)
        ) {
          const closeDate = new Date(now);
          closeDate.setUTCHours(closeHour - 7, closeMinute, 0, 0);
          if (closeDate <= now) closeDate.setUTCDate(closeDate.getUTCDate() + 1);
          isLive = now >= closeDate && now < drawDate;
        }
      }
      return { city: c.city, startsAt, isLive };
    });

    res.json(enriched);
  } catch (err) {
    if (err.code === 'P1001' || err.code === 'P1002') {
      console.error('[listPools] Database unavailable:', err);
      return res.status(503).json({ error: 'database unavailable' });
    }
    console.error('[listPools] Unexpected error:', err);
    res.status(500).json({ error: 'internal server error' });
  }
};

exports.latestByCity = async (req, res) => {
  const { city } = req.params;
  try {
    const result = await prisma.lotteryResult.findFirst({
      where: { city },
      orderBy: { drawDate: 'desc' },
    });
    if (!result) {
      console.warn(`No lottery result found for city ${city}`);
      return res.status(404).json({ error: 'result missing' });
    }
    const schedule = await prisma.schedule.findUnique({ where: { city } });
    if (!schedule || !schedule.drawTime || !schedule.closeTime) {
      console.warn(`No schedule found for city ${city}`);
      return res.status(404).json({ error: 'schedule missing' });
    }

    let nextDraw = null;
    let nextClose = null;

    if (!/^\d{2}:\d{2}$/.test(schedule.drawTime)) {
      console.error(`Invalid drawTime format for city ${city}: ${schedule.drawTime}`);
      return res.status(400).json({ message: 'Invalid drawTime format' });
    }
    if (!/^\d{2}:\d{2}$/.test(schedule.closeTime)) {
      console.error(`Invalid closeTime format for city ${city}: ${schedule.closeTime}`);
      return res.status(400).json({ message: 'Invalid closeTime format' });
    }

    const [drawHour, drawMinute] = schedule.drawTime.split(':').map(Number);
    const [closeHour, closeMinute] = schedule.closeTime.split(':').map(Number);

    if (
      Number.isNaN(drawHour) ||
      Number.isNaN(drawMinute) ||
      drawHour < 0 ||
      drawHour > 23 ||
      drawMinute < 0 ||
      drawMinute > 59
    ) {
      console.error(`Invalid drawTime value for city ${city}: ${schedule.drawTime}`);
      return res.status(400).json({ message: 'Invalid drawTime value' });
    }

    if (
      Number.isNaN(closeHour) ||
      Number.isNaN(closeMinute) ||
      closeHour < 0 ||
      closeHour > 23 ||
      closeMinute < 0 ||
      closeMinute > 59
    ) {
      console.error(`Invalid closeTime value for city ${city}: ${schedule.closeTime}`);
      return res.status(400).json({ message: 'Invalid closeTime value' });
    }

    const now = jakartaDate();

    const nextDrawDate = new Date(now);
    nextDrawDate.setUTCHours(drawHour - 7, drawMinute, 0, 0);
    if (nextDrawDate <= now)
      nextDrawDate.setUTCDate(nextDrawDate.getUTCDate() + 1);
    nextDraw = nextDrawDate;

    const nextCloseDate = new Date(now);
    nextCloseDate.setUTCHours(closeHour - 7, closeMinute, 0, 0);
    if (nextCloseDate <= now)
      nextCloseDate.setUTCDate(nextCloseDate.getUTCDate() + 1);
    nextClose = nextCloseDate;

    res.json({
      ...result,
      nextDraw: nextDraw.toISOString(),
      nextClose: nextClose.toISOString(),
    });
  } catch (err) {
    if (err.code === 'P1001' || err.code === 'P1002') {
      console.error(`[latestByCity] Database unavailable for city ${city}:`, err);
      return res.status(503).json({ error: 'database unavailable' });
    }
    console.error(`[latestByCity] Unexpected error processing city ${city}:`, err);
    res.status(500).json({ error: 'internal server error' });
  }
};

// Fetch latest results for multiple cities at once
exports.latestMany = async (req, res) => {
  const citiesParam = req.query.cities;
  const cities = citiesParam
    ? citiesParam.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  try {
    const results = await prisma.lotteryResult.findMany({
      where: cities.length ? { city: { in: cities } } : undefined,
      orderBy: [{ city: 'asc' }, { drawDate: 'desc' }],
      distinct: ['city'],
    });

    const schedules = await prisma.schedule.findMany({
      where: cities.length ? { city: { in: cities } } : undefined,
    });
    const scheduleMap = Object.fromEntries(schedules.map((s) => [s.city, s]));

    const now = jakartaDate();
    const enriched = results.map((r) => {
      const schedule = scheduleMap[r.city];
      let nextDraw = null;
      let nextClose = null;
      if (
        schedule &&
        /^\d{2}:\d{2}$/.test(schedule.drawTime) &&
        /^\d{2}:\d{2}$/.test(schedule.closeTime)
      ) {
        const [drawHour, drawMinute] = schedule.drawTime.split(':').map(Number);
        const [closeHour, closeMinute] = schedule.closeTime.split(':').map(Number);
        if (
          !Number.isNaN(drawHour) &&
          !Number.isNaN(drawMinute) &&
          drawHour >= 0 &&
          drawHour <= 23 &&
          drawMinute >= 0 &&
          drawMinute <= 59 &&
          !Number.isNaN(closeHour) &&
          !Number.isNaN(closeMinute) &&
          closeHour >= 0 &&
          closeHour <= 23 &&
          closeMinute >= 0 &&
          closeMinute <= 59
        ) {
          const nextD = new Date(now);
          nextD.setUTCHours(drawHour - 7, drawMinute, 0, 0);
          if (nextD <= now) nextD.setUTCDate(nextD.getUTCDate() + 1);
          nextDraw = nextD;

          const nextC = new Date(now);
          nextC.setUTCHours(closeHour - 7, closeMinute, 0, 0);
          if (nextC <= now) nextC.setUTCDate(nextC.getUTCDate() + 1);
          nextClose = nextC;
        }
      }
      return {
        ...r,
        nextDraw: nextDraw ? nextDraw.toISOString() : null,
        nextClose: nextClose ? nextClose.toISOString() : null,
      };
    });

    res.json(enriched);
  } catch (err) {
    if (err.code === 'P1001' || err.code === 'P1002') {
      console.error('[latestMany] Database unavailable:', err);
      return res.status(503).json({ error: 'database unavailable' });
    }
    console.error('[latestMany] Unexpected error:', err);
    res.status(500).json({ error: 'internal server error' });
  }
};
exports.deletePool = async (req, res) => {
  const { city } = req.params;
  try {
    await prisma.override.deleteMany({ where: { city } });
    await prisma.fetchError.deleteMany({ where: { city } });
    const result = await prisma.lotteryResult.deleteMany({ where: { city } });
    res.json({ count: result.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addPool = async (req, res) => {
  const { city } = req.body;
  if (!city) return res.status(400).json({ message: 'city required' });
  try {
    const result = await prisma.lotteryResult.create({
      data: {
        city,
        drawDate: new jakartaDate(),
        firstPrize: '',
        secondPrize: '',
        thirdPrize: '',
      },    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.publicSchedules = async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({ orderBy: { city: 'asc' } });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.overrideResults = async (req, res) => {
  const { city } = req.params;
  const { drawDate, firstPrize, secondPrize, thirdPrize } = req.body;
  try {
        const date = jakartaDate(drawDate);

    // Fetch current numbers before update (if any)
    const existing = await prisma.lotteryResult.findUnique({
      where: { city_drawDate: { city, drawDate: date } },
      select: { firstPrize: true, secondPrize: true, thirdPrize: true },
    });

    // Upsert the result with the new numbers
    const result = await prisma.lotteryResult.upsert({
      where: { city_drawDate: { city, drawDate: date } },
      update: { firstPrize, secondPrize, thirdPrize },
      create: { city, drawDate: date, firstPrize, secondPrize, thirdPrize },
    });
        // Record the override action
    await prisma.override.create({
      data: {
        city,
        oldNumbers: [existing?.firstPrize, existing?.secondPrize, existing?.thirdPrize].filter(Boolean).join(','),
        newNumbers: [firstPrize, secondPrize, thirdPrize].join(','),
        adminUsername: req.user.username,
      },
    });

    // Notify clients that this city's result has changed
    const io = getIO();
    io.emit('resultUpdated', { city });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Orchestrate a live draw with three prize rounds.
// Each prize consists of six digits sent sequentially via Socket.IO.
exports.startLiveDraw = async (req, res) => {
  const { city } = req.params;

  if (activeLiveDraws.has(city)) {
    return res.status(409).json({ error: 'live draw already in progress' });
  }

  activeLiveDraws.add(city);

  try {
    const io = getIO();

    // Helper to build an array of 6 digits from body or random number
    const digitsFrom = (src) => {
      const str =
        typeof src === 'string' && /^\d{6}$/.test(src)
          ? src
          : String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
      return str.split('').map((d) => Number(d));
    };

    const prizeDefs = [
      { key: 'first', value: digitsFrom(req.body?.firstPrize) },
      { key: 'second', value: digitsFrom(req.body?.secondPrize) },
      { key: 'third', value: digitsFrom(req.body?.thirdPrize) },
    ];

    const finalize = () => {
      activeLiveDraws.delete(city);
      emitLiveMeta(city).catch(() => {});
    };

    const drawPrize = (prizeIndex) => {
      if (prizeIndex >= prizeDefs.length) {
        setTimeout(finalize, 10 * 60 * 1000);
        return;
      }
      const prize = prizeDefs[prizeIndex];
      io.to(city).emit('prizeStart', { city, prize: prize.key });
      prize.value.forEach((num, idx) => {
        setTimeout(() => {
          io.to(city).emit('drawNumber', {
            city,
            prize: prize.key,
            index: idx,
            number: num,
          });
          if (idx === prize.value.length - 1) {
            setTimeout(() => drawPrize(prizeIndex + 1), 60000);
          }
        }, idx * 60000);
      });
    };

    emitLiveMeta(city).catch(() => {});
    drawPrize(0);

    res.json({ message: 'live draw started', city });
  } catch (err) {
    activeLiveDraws.delete(city);
    console.error('[startLiveDraw] Error:', err);
    res.status(500).json({ error: 'internal server error' });
  }
};


function jakartaDate(input) {
  // Return current UTC time when called without arguments
  if (!input) {
    return new Date();
  }

  // input dari <input type="datetime-local"> seperti "2025-07-21T04:55"
  const [datePart, timePart] = (input || '').split('T');
  // jika format tidak sesuai, fallback ke waktu saat ini
  if (!datePart || !timePart) return new Date();

  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  // Convert Jakarta (UTC+7) time to UTC
  return new Date(Date.UTC(year, month - 1, day, hour - 7, minute));
}

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
    return res
      .status(500)
      .json({ error: 'admin credentials are not configured' });
  }

  if (!username || !password) {
    return res.status(400).json({ message: 'username and password required' });
  }

  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const match = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!match) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    console.error('[login] Error:', err);
    res.status(500).json({ error: 'internal server error' });
  }
};

exports.authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
exports.listAllHistory = async (req, res) => {
  try {
    const records = await prisma.lotteryResult.findMany({
      orderBy: { drawDate: 'desc' },
    });
    res.json(records);
  } catch (err) {
    console.error('[listAllHistory] Error:', err);
    res.status(500).json({ error: err.message });
  }
};
/**
 * GET /api/admin/overrides?limit=10
 */
exports.logFetchError = async (city, message) => {
  await prisma.fetchError.create({ data: { city, message } });
};

/**
 * GET /api/admin/overrides?limit=10
 */
exports.listOverrides = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  try {
    const records = await prisma.override.findMany({
      orderBy: { time: 'desc' },
      take: limit,
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/admin/stats
 */
// controllers/lottery.controller.js
exports.getStats = async (req, res) => {
  try {
    // 1. Total kota unik
    const cityGroups = await prisma.lotteryResult.groupBy({
      by: ['city'],
    });
    const totalCities = cityGroups.length;

    // 2. Hitung fetch hari ini
    const today = jakartaDate();
    today.setHours(0, 0, 0, 0);
    const todayFetches = await prisma.lotteryResult.count({
      where: { fetchedAt: { gte: today } },
    });

    // 3. Hitung error hari ini
    const fetchErrors = await prisma.fetchError.count({
      where: { time: { gte: today } },
    });

    // 4. Waktu override terakhir
    const lastOverrideRec = await prisma.override.findFirst({
      orderBy: { time: 'desc' },
      select: { time: true },
    });
    const lastOverrideTime = lastOverrideRec
      ? lastOverrideRec.time.toISOString()
      : null;

    // 5. Distribusi fetch per jam hari ini
    const fetchByHourRaw = await prisma.$queryRaw`
      SELECT
        EXTRACT(HOUR FROM "fetchedAt")::int AS hour,
        COUNT(*) AS count
      FROM "LotteryResult"
      WHERE "fetchedAt" >= ${today}
      GROUP BY hour
      ORDER BY hour
    `;

    // Convert BigInt -> Number
    const fetchByHour = fetchByHourRaw.map(row => ({
      hour: Number(row.hour),
      count: Number(row.count),
    }));

    return res.json({
      totalCities,
      todayFetches,
      fetchErrors,
      lastOverrideTime,
      fetchByHour,
    });
  } catch (err) {
    console.error('[getStats] Error:', err);
    return res.status(500).json({ error: err.message });
  }
};
// ----- Schedule CRUD -----
exports.listSchedules = async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({ orderBy: { city: 'asc' } });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSchedule = async (req, res) => {
  const { city, drawTime, closeTime } = req.body;
  if (!city || !drawTime || !closeTime) {
    return res.status(400).json({ message: 'city, drawTime and closeTime required' });
  }
  try {
    const schedule = await prisma.schedule.create({ data: { city, drawTime, closeTime } });
    await emitLiveMeta(city, schedule);
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSchedule = async (req, res) => {
  const { city } = req.params;
  const { drawTime, closeTime } = req.body;
  if (!drawTime && !closeTime) return res.status(400).json({ message: 'drawTime or closeTime required' });
  try {
    const schedule = await prisma.schedule.update({ where: { city }, data: { drawTime, closeTime } });
    await emitLiveMeta(city, schedule);
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  const { city } = req.params;
  try {
    await prisma.schedule.delete({ where: { city } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.emitLiveMeta = emitLiveMeta;