const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

function loadController(mockPrisma, mockIO = { to() { return { emit() {} }; }, emit() {} }) {
  const dbPath = path.resolve(__dirname, '../src/config/database.js');
  const ioPath = path.resolve(__dirname, '../src/io.js');
  const ctrlPath = path.resolve(__dirname, '../src/controllers/lottery.controller.js');
  const statePath = path.resolve(__dirname, '../src/liveDrawState.js');
  // Inject mocks into require cache before requiring controller
  require.cache[dbPath] = { exports: mockPrisma };
  require.cache[ioPath] = { exports: { getIO: () => mockIO } };
  require(statePath).activeLiveDraws.clear();
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
  const mockPrisma = {
    override: {
      findFirst: async () => ({ newNumbers: '12345,23456,34567' }),
    },
  };
  const ctrl = loadController(mockPrisma);

  const origSetTimeout = global.setTimeout;
  global.setTimeout = () => 0;
  try {
    await ctrl.startLiveDraw({ params: { city: 'jakarta' } }, { json() {} });
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
    await ctrl.startLiveDraw({ params: { city: 'jakarta' } }, res);
    assert.equal(status, 409);
    assert.deepEqual(body, { error: 'live draw already in progress' });
  } finally {
    global.setTimeout = origSetTimeout;
  }
});

test('startLiveDraw allows new draw after completion', async () => {
  const mockPrisma = {
    override: {
      findFirst: async () => ({ newNumbers: '12345,23456,34567' }),
    },
  };
  const ctrl = loadController(mockPrisma);

  const origSetTimeout = global.setTimeout;
  global.setTimeout = (fn) => {
    fn();
    return 0;
  };
  try {
    await ctrl.startLiveDraw({ params: { city: 'jakarta' } }, { json() {} });
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
    await ctrl.startLiveDraw({ params: { city: 'jakarta' } }, res);
    assert.equal(status, undefined);
    assert.deepEqual(body, { message: 'live draw started', city: 'jakarta' });
  } finally {
    global.setTimeout = origSetTimeout;
  }
});

test('startLiveDraw returns 400 when override result missing', async () => {
  const mockPrisma = {
    override: { findFirst: async () => null },
  };
  const ctrl = loadController(mockPrisma);
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
  await ctrl.startLiveDraw({ params: { city: 'jakarta' } }, res);
  assert.equal(status, 400);
  assert.deepEqual(body, { error: 'override result missing' });
});

test('emitLiveMeta emits nextClose and nextDraw when schedule changes', { concurrency: false }, async () => {
  const events = [];
  const mockIO = {
    to() {
      return {
        emit(event, payload) {
          events.push({ event, payload });
        },
      };
    },
  };
  const ctrl = loadController({}, mockIO);

  const realDate = Date;
  // Fix current time to ensure deterministic scheduling
  global.Date = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        return new realDate('2023-01-01T00:00:00Z');
      }
      return new realDate(...args);
    }
  };

  try {
    await ctrl.emitLiveMeta('jakarta', {
      drawTime: '08:00',
      closeTime: '07:00',
    });
    await ctrl.emitLiveMeta('jakarta', {
      drawTime: '09:00',
      closeTime: '07:00',
    });

    assert.equal(events.length, 2);
    const first = events[0].payload;
    const second = events[1].payload;
    assert.ok(first.nextClose);
    assert.ok(first.nextDraw);
    assert.ok(second.nextClose);
    assert.ok(second.nextDraw);
    } finally {
      global.Date = realDate;
    }
  });
