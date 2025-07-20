require('dotenv').config();

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
 const schedules = [
    { city: 'Jakarta',      closeTime: '13:45', drawTime: '14:15' },
    { city: 'Bandung',      closeTime: '16:45', drawTime: '17:55' },
    { city: 'Surabaya',     closeTime: '22:40', drawTime: '23:20' },
    { city: 'Bekasi',       closeTime: '00:00', drawTime: '00:30' },
    { city: 'Medan',        closeTime: '00:30', drawTime: '01:00' },
    { city: 'Depok',        closeTime: '01:00', drawTime: '01:30' },
    { city: 'Palembang',    closeTime: '01:30', drawTime: '02:00' },
    { city: 'Semarang',     closeTime: '02:00', drawTime: '02:30' },
    { city: 'Makasar',      closeTime: '02:30', drawTime: '03:00' },
    { city: 'Tangerang',    closeTime: '03:00', drawTime: '03:30' },
    { city: 'Batam',        closeTime: '03:30', drawTime: '04:00' },
    { city: 'Pekanbaru',    closeTime: '10:00', drawTime: '10:30' },
    { city: 'Bogor',        closeTime: '10:30', drawTime: '11:00' },
    { city: 'Lampung',      closeTime: '11:00', drawTime: '11:30' },
    { city: 'Padang',       closeTime: '11:30', drawTime: '12:00' },
    { city: 'Malang',       closeTime: '12:00', drawTime: '12:30' },
    { city: 'Samarinda',    closeTime: '12:30', drawTime: '13:00' },
    { city: 'Tasikmalaya',  closeTime: '13:00', drawTime: '13:30' },
    { city: 'Serang',       closeTime: '13:30', drawTime: '14:00' },
    { city: 'Balikpapan',   closeTime: '14:00', drawTime: '14:30' },
    { city: 'Pontianak',    closeTime: '14:30', drawTime: '15:00' },
    { city: 'Banjarmasin',  closeTime: '15:00', drawTime: '15:30' },
    { city: 'Denpasar',     closeTime: '15:30', drawTime: '16:00' },
    { city: 'Jambi',        closeTime: '16:00', drawTime: '16:30' },
    { city: 'Surakarta',    closeTime: '16:30', drawTime: '17:00' },
    { city: 'Cimahi',       closeTime: '19:30', drawTime: '20:00' },
    { city: 'Cilegon',      closeTime: '20:00', drawTime: '20:30' },
    { city: 'Mataram',      closeTime: '20:30', drawTime: '21:00' },
    { city: 'Manado',       closeTime: '21:00', drawTime: '21:30' },
    { city: 'Yogyakarta',   closeTime: '21:30', drawTime: '22:00' },
    { city: 'Jayapura',     closeTime: '22:00', drawTime: '22:30' },
  ];  const drawDate = new Date();
  for (const { city, drawTime, closeTime } of schedules) {
    await prisma.lotteryResult.create({
      data: {
        city,
        drawDate,
        firstPrize: '',
        secondPrize: '',
        thirdPrize: '',
          },
    });
    await prisma.schedule.create({ data: { city, drawTime, closeTime } });
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
