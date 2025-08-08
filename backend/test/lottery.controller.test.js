const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

function loadController(mockPrisma) {
  const dbPath = path.resolve(__dirname, '../src/config/database.js');
  const ctrlPath = path.resolve(__dirname, '../src/controllers/lottery.controller.js');
  // Inject mock prisma into require cache before requiring controller
  require.cache[dbPath] = { exports: mockPrisma };
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
