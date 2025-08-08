const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

function loadController(mockPrisma, mockIO = { to() { return { emit() {} }; }, emit() {} }) {
  const dbPath = path.resolve(__dirname, '../src/config/database.js');
  const ioPath = path.resolve(__dirname, '../src/io.js');
  const ctrlPath = path.resolve(__dirname, '../src/controllers/lottery.controller.js');
  // Inject mocks into require cache before requiring controller
  require.cache[dbPath] = { exports: mockPrisma };
  require.cache[ioPath] = { exports: { getIO: () => mockIO } };
  delete require.cache[ctrlPath];
  return require(ctrlPath);
}

test('latestByCity returns 404 when schedule is missing', async () => {
  const mockPrisma = {
    lotteryResult: {
      findFirst: async () => ({ city: 'jakarta', drawDate: new Date(), firstPrize: '', secondPrize: '', thirdPrize: '' })
    },
    schedule: {
      findUnique: async () => null
    }
  };
  const ctrl = loadController(mockPrisma);
  const req = { params: { city: 'jakarta' } };
  let statusCode, body;
  const res = {
    status(code) { statusCode = code; return this; },
    json(obj) { body = obj; }
  };
  await ctrl.latestByCity(req, res);
  assert.equal(statusCode, 404);
  assert.deepEqual(body, { error: 'schedule missing' });
});

test('latestByCity returns 400 when drawTime is invalid', async () => {
  const mockPrisma = {
    lotteryResult: {
      findFirst: async () => ({ city: 'jakarta', drawDate: new Date(), firstPrize: '', secondPrize: '', thirdPrize: '' })
    },
    schedule: {
      findUnique: async () => ({ city: 'jakarta', drawTime: '99:99', closeTime: '10:00' })
    }
  };
  const ctrl = loadController(mockPrisma);
  const req = { params: { city: 'jakarta' } };
  let statusCode, body;
  const res = {
    status(code) { statusCode = code; return this; },
    json(obj) { body = obj; }
  };
  await ctrl.latestByCity(req, res);
  assert.equal(statusCode, 400);
  assert.deepEqual(body, { message: 'Invalid drawTime value' });
});

test('listPools returns schedule info', async () => {
  const mockPrisma = {
    lotteryResult: {
      findMany: async () => [{ city: 'jakarta' }, { city: 'bandung' }],
    },
    schedule: {
      findMany: async () => [
        { city: 'jakarta', drawTime: '10:00', closeTime: '09:00' },
      ],
    },
  };
  const ctrl = loadController(mockPrisma);
  let body;
  const res = { json(obj) { body = obj; } };
  await ctrl.listPools({}, res);
  assert.equal(Array.isArray(body), true);
  assert.equal(body.length, 2);
  const jakarta = body.find((c) => c.city === 'jakarta');
  assert.ok(jakarta.startsAt);
  assert.ok(Date.parse(jakarta.startsAt));
  assert.strictEqual(typeof jakarta.isLive, 'boolean');
  const bandung = body.find((c) => c.city === 'bandung');
  assert.equal(bandung.startsAt, null);
  assert.equal(bandung.isLive, false);
});

test('startLiveDraw returns 409 if city already active', async () => {
  const mockPrisma = {};
  const ctrl = loadController(mockPrisma);

  // Prevent scheduled callbacks from running so the draw stays active
  const origSetTimeout = global.setTimeout;
  global.setTimeout = () => 0;
  try {
    await ctrl.startLiveDraw({ params: { city: 'jakarta' }, body: {} }, { json() {} });
    let status, body;
    const res = {
      status(code) {
        status = code;
        return this;
      },
      json(obj) {
        body = obj;
      },
    };
    await ctrl.startLiveDraw({ params: { city: 'jakarta' }, body: {} }, res);
    assert.equal(status, 409);
    assert.deepEqual(body, { error: 'live draw already in progress' });
  } finally {
    global.setTimeout = origSetTimeout;
  }
});

test('startLiveDraw allows new draw after completion', async () => {
  const mockPrisma = {};
  const ctrl = loadController(mockPrisma);

  // Execute timers immediately to finalize draw
  const origSetTimeout = global.setTimeout;
  global.setTimeout = (fn) => {
    fn();
    return 0;
  };
  try {
    await ctrl.startLiveDraw({ params: { city: 'jakarta' }, body: {} }, { json() {} });
    let status, body;
    const res = {
      status(code) {
        status = code;
        return this;
      },
      json(obj) {
        body = obj;
      },
    };
    await ctrl.startLiveDraw({ params: { city: 'jakarta' }, body: {} }, res);
    assert.equal(status, undefined);
    assert.deepEqual(body, { message: 'live draw started', city: 'jakarta' });
  } finally {
    global.setTimeout = origSetTimeout;
  }
});
