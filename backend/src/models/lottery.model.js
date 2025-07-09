const prisma = require('../config/database');

module.exports = {
  async getAllCities() {
    return prisma.lotteryResult.findMany({
      distinct: ['city'],
      orderBy: {
        city: 'asc',
      },
    });
  },

  async getLatestByCity(city) {
    return prisma.lotteryResult.findFirst({
      where: { city },
      orderBy: {
        drawDate: 'desc',
      },
    });
  },

  async createResult(data) {
    return prisma.lotteryResult.create({ data });
  },

  async overrideResult(city, drawDate, numbers) {
    return prisma.lotteryResult.upsert({
      where: { city_drawDate: { city, drawDate } },
      update: { numbers },
      create: { city, drawDate, numbers },
    });
  },
};
