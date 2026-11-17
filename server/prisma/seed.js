require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/config/db');
const { toUtcDate } = require('../src/utils/dateUtils');

function formatDateYMD(year, month1Based, day) {
  const mm = String(month1Based).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

async function main() {
  console.log('Seeding Sweety database...');

  const demoEmail = 'demo@sweety.test';
  const demoPasswordHash = await bcrypt.hash('Demo@1234', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: 'Demo User',
      password_hash: demoPasswordHash,
    },
    create: {
      name: 'Demo User',
      email: demoEmail,
      password_hash: demoPasswordHash,
    },
  });

  console.log(`Demo user ready: ${demoUser.email} (id: ${demoUser.id})`);

  // Clear existing readings for demo user to ensure clean, reproducible seed data
  await prisma.reading.deleteMany({
    where: { user_id: demoUser.id },
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1..12
  const currentDay = now.getDate();

  const prevMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;

  const readingsToCreate = [];

  // 1. Four readings on today's date (or current date)
  const todayStr = formatDateYMD(currentYear, currentMonth, currentDay);
  readingsToCreate.push(
    { reading_date: todayStr, time_slot: 'MORNING_FASTING', glucose_value: 95 },
    { reading_date: todayStr, time_slot: 'AFTER_BREAKFAST', glucose_value: 120 },
    { reading_date: todayStr, time_slot: 'AFTER_LUNCH', glucose_value: 160 },
    { reading_date: todayStr, time_slot: 'AFTER_DINNER', glucose_value: 115 }
  );

  // 2. Additional readings earlier in the current month (for Month-to-Date reporting)
  const earlierDaysInCurrentMonth = [1, 3, 5, 8, 12].filter((d) => d < currentDay);
  if (earlierDaysInCurrentMonth.length === 0 && currentDay > 1) {
    earlierDaysInCurrentMonth.push(currentDay - 1);
  }

  earlierDaysInCurrentMonth.forEach((dayNum, index) => {
    const dateStr = formatDateYMD(currentYear, currentMonth, dayNum);
    readingsToCreate.push(
      {
        reading_date: dateStr,
        time_slot: 'MORNING_FASTING',
        glucose_value: 92 + index * 4,
      },
      {
        reading_date: dateStr,
        time_slot: 'AFTER_LUNCH',
        glucose_value: 138 + index * 6,
      }
    );
    if (index % 2 === 0) {
      readingsToCreate.push({
        reading_date: dateStr,
        time_slot: 'AFTER_DINNER',
        glucose_value: 124 + index * 5,
      });
    }
  });

  // 3. Readings across multiple days in the previous calendar month (for Previous Monthly report)
  const prevMonthSampleDays = [2, 6, 10, 15, 20, 25];
  prevMonthSampleDays.forEach((dayNum, idx) => {
    const dateStr = formatDateYMD(prevMonthYear, prevMonth, dayNum);
    readingsToCreate.push(
      {
        reading_date: dateStr,
        time_slot: 'MORNING_FASTING',
        glucose_value: 90 + idx * 3,
      },
      {
        reading_date: dateStr,
        time_slot: 'AFTER_BREAKFAST',
        glucose_value: 125 + idx * 4,
      },
      {
        reading_date: dateStr,
        time_slot: 'AFTER_LUNCH',
        glucose_value: 145 + idx * 5,
      }
    );
    if (idx === 3) {
      // Full 4 readings on the 15th of the previous month
      readingsToCreate.push({
        reading_date: dateStr,
        time_slot: 'AFTER_DINNER',
        glucose_value: 118,
      });
    }
  });

  for (const item of readingsToCreate) {
    await prisma.reading.upsert({
      where: {
        unique_user_date_slot: {
          user_id: demoUser.id,
          reading_date: toUtcDate(item.reading_date),
          time_slot: item.time_slot,
        },
      },
      update: {
        glucose_value: item.glucose_value,
      },
      create: {
        user_id: demoUser.id,
        reading_date: toUtcDate(item.reading_date),
        time_slot: item.time_slot,
        glucose_value: item.glucose_value,
      },
    });
  }

  console.log(`Seeded ${readingsToCreate.length} blood glucose readings for ${demoEmail}.`);
}

main()
  .catch((err) => {
    console.error('Seed script failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
