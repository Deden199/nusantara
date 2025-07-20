const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

exports.listPools = async (req, res) => {
  try {
    const cities = await prisma.lotteryResult.findMany({
      distinct: ['city'],
      orderBy: { city: 'asc' },
    });
    res.json(cities.map(c => c.city));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.latestByCity = async (req, res) => {
  const { city } = req.params;
  try {
    const result = await prisma.lotteryResult.findFirst({
      where: { city },
      orderBy: { drawDate: 'desc' },
    });
    if (!result) return res.status(404).json({ message: 'Not found' });
    const schedule = await prisma.schedule.findUnique({ where: { city } });
    res.json({ ...result, nextDraw: schedule?.nextDraw || null });  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addPool = async (req, res) => {
  const { city } = req.body;
  if (!city) return res.status(400).json({ message: 'city required' });
  try {
    const result = await prisma.lotteryResult.create({
      data: { city, drawDate: new Date(), numbers: '' },
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.overrideResults = async (req, res) => {
  const { city } = req.params;
  const { drawDate, numbers } = req.body;
  try {
        const date = new Date(drawDate);

    // Fetch current numbers before update (if any)
    const existing = await prisma.lotteryResult.findUnique({
      where: { city_drawDate: { city, drawDate: date } },
      select: { numbers: true },
    });

    // Upsert the result with the new numbers
    const result = await prisma.lotteryResult.upsert({
      where: { city_drawDate: { city, drawDate: date } },
      update: { numbers },
      create: { city, drawDate: date, numbers },
    });
        // Record the override action
    await prisma.override.create({
      data: {
        city,
        oldNumbers: existing?.numbers || '',
        newNumbers: numbers,
        adminUsername: req.user.username,
      },
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
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
exports.logFetchError = async (city, message) => {
  await prisma.fetchError.create({ data: { city, message } });
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
    const today = new Date();
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
  const { city, nextDraw } = req.body;
  if (!city || !nextDraw) return res.status(400).json({ message: 'city and nextDraw required' });
  try {
    const schedule = await prisma.schedule.create({ data: { city, nextDraw: new Date(nextDraw) } });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSchedule = async (req, res) => {
  const { city } = req.params;
  const { nextDraw } = req.body;
  if (!nextDraw) return res.status(400).json({ message: 'nextDraw required' });
  try {
    const schedule = await prisma.schedule.update({ where: { city }, data: { nextDraw: new Date(nextDraw) } });
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