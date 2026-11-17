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
  console.log('Seeding Sweety database with daily glucose readings...');

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
  const daysInPrevMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 0)).getUTCDate();

  const readingsToCreate = [];

  // 1. Seed daily readings across the entire previous calendar month
  for (let day = 1; day <= daysInPrevMonth; day++) {
    const dateStr = formatDateYMD(prevMonthYear, prevMonth, day);
    const wave = (day * 7) % 24;

    readingsToCreate.push(
      {
        reading_date: dateStr,
        time_slot: 'MORNING_FASTING',
        glucose_value: 88 + (day % 18), // 88..105 mg/dL
      },
      {
        reading_date: dateStr,
        time_slot: 'AFTER_BREAKFAST',
        glucose_value: 118 + wave, // 118..141 mg/dL
      },
      {
        reading_date: dateStr,
        time_slot: 'AFTER_LUNCH',
        glucose_value: 130 + ((day * 5) % 38), // 130..167 mg/dL
      }
    );

    // Add 4th slot (After dinner) on most days for realistic variety
    if (day % 3 !== 0) {
      readingsToCreate.push({
        reading_date: dateStr,
        time_slot: 'AFTER_DINNER',
        glucose_value: 112 + ((day * 3) % 30), // 112..141 mg/dL
      });
    }
  }

  // 2. Seed daily readings for every day of the current month up to yesterday
  for (let day = 1; day < currentDay; day++) {
    const dateStr = formatDateYMD(currentYear, currentMonth, day);
    const offset = (day * 5) % 22;

    readingsToCreate.push(
      {
        reading_date: dateStr,
        time_slot: 'MORNING_FASTING',
        glucose_value: 90 + (day % 16), // 90..105 mg/dL
      },
      {
        reading_date: dateStr,
        time_slot: 'AFTER_BREAKFAST',
        glucose_value: 116 + offset, // 116..137 mg/dL
      },
      {
        reading_date: dateStr,
        time_slot: 'AFTER_LUNCH',
        glucose_value: 132 + ((day * 7) % 36), // 132..167 mg/dL
      }
    );

    if (day % 2 === 0 || day === currentDay - 1) {
      readingsToCreate.push({
        reading_date: dateStr,
        time_slot: 'AFTER_DINNER',
        glucose_value: 114 + ((day * 4) % 26), // 114..139 mg/dL
      });
    }
  }

  // 3. Today's 4 readings (matching the spec sheet example: 95, 120, 160, 115 -> avg 122.5)
  const todayStr = formatDateYMD(currentYear, currentMonth, currentDay);
  readingsToCreate.push(
    { reading_date: todayStr, time_slot: 'MORNING_FASTING', glucose_value: 95 },
    { reading_date: todayStr, time_slot: 'AFTER_BREAKFAST', glucose_value: 120 },
    { reading_date: todayStr, time_slot: 'AFTER_LUNCH', glucose_value: 160 },
    { reading_date: todayStr, time_slot: 'AFTER_DINNER', glucose_value: 115 }
  );

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

  console.log(`Seeded ${readingsToCreate.length} daily blood glucose readings for ${demoEmail}.`);
}

main()
  .catch((err) => {
    console.error('Seed script failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
