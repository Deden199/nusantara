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
    res.json(result);
  } catch (err) {
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
    const result = await prisma.lotteryResult.upsert({
      where: { city_drawDate: { city, drawDate: new Date(drawDate) } },
      update: { numbers },
      create: { city, drawDate: new Date(drawDate), numbers },
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
