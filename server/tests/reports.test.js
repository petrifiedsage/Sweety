const request = require('supertest');
const { createInMemoryPrisma } = require('./helpers/testDb');

const mockPrisma = createInMemoryPrisma();
jest.mock('../src/config/db', () => mockPrisma);

const app = require('../src/app');
const cacheService = require('../src/services/cacheService');

describe('Reporting Module (/api/reports)', () => {
  let token;
  let otherToken;

  beforeEach(async () => {
    mockPrisma.$Reset();
    cacheService.clearAllCache();

    const res = await request(app).post('/api/auth/register').send({
      name: 'Report User',
      email: 'reports@sweety.test',
      password: 'Password123!',
    });
    token = res.body.token;

    const otherRes = await request(app).post('/api/auth/register').send({
      name: 'Other User',
      email: 'other@sweety.test',
      password: 'Password123!',
    });
    otherToken = otherRes.body.token;
  });

  async function seedReading(authToken, reading_date, time_slot, glucose_value) {
    return request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ reading_date, time_slot, glucose_value });
  }

  test('1. Daily report calculates exact highest, lowest, average (1 decimal), total, and ordered slot list (FR-04A)', async () => {
    // Spec example: 95, 120, 160, 115 on 2026-10-15 -> Highest 160, Lowest 95, Average 122.5, Total 4
    await seedReading(token, '2026-10-15', 'AFTER_LUNCH', 160);
    await seedReading(token, '2026-10-15', 'MORNING_FASTING', 95);
    await seedReading(token, '2026-10-15', 'AFTER_DINNER', 115);
    await seedReading(token, '2026-10-15', 'AFTER_BREAKFAST', 120);

    // Another user's reading on same date must not affect statistics
    await seedReading(otherToken, '2026-10-15', 'MORNING_FASTING', 500);

    const res = await request(app)
      .get('/api/reports/daily?date=2026-10-15')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.date_range).toEqual({
      from: '2026-10-15',
      to: '2026-10-15',
    });
    expect(res.body.statistics).toEqual({
      highest: 160,
      lowest: 95,
      average: 122.5,
      total_readings: 4,
    });
    expect(res.body.readings.map((r) => r.time_slot)).toEqual([
      'MORNING_FASTING',
      'AFTER_BREAKFAST',
      'AFTER_LUNCH',
      'AFTER_DINNER',
    ]);
  });

  test('2. Month-to-date (MTD) report includes readings from 1st of month through selected date (FR-04B)', async () => {
    await seedReading(token, '2026-09-30', 'MORNING_FASTING', 200); // Previous month (excluded)
    await seedReading(token, '2026-10-01', 'MORNING_FASTING', 100); // Included (boundary start)
    await seedReading(token, '2026-10-10', 'AFTER_LUNCH', 135);     // Included
    await seedReading(token, '2026-10-15', 'AFTER_DINNER', 160);    // Included (boundary end)
    await seedReading(token, '2026-10-16', 'MORNING_FASTING', 300); // After selected date (excluded)

    const res = await request(app)
      .get('/api/reports/month-to-date?date=2026-10-15')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.date_range).toEqual({
      from: '2026-10-01',
      to: '2026-10-15',
    });
    // (100 + 135 + 160) / 3 = 395 / 3 = 131.666... -> 131.7
    expect(res.body.statistics).toEqual({
      highest: 160,
      lowest: 100,
      average: 131.7,
      total_readings: 3,
    });
  });

  test('3. Previous Monthly report calculates full previous calendar month and respects date boundaries (FR-04C)', async () => {
    await seedReading(token, '2026-08-31', 'MORNING_FASTING', 250); // Excluded
    await seedReading(token, '2026-09-01', 'MORNING_FASTING', 90);  // Included
    await seedReading(token, '2026-09-15', 'AFTER_LUNCH', 140);     // Included
    await seedReading(token, '2026-09-30', 'AFTER_DINNER', 110);    // Included
    await seedReading(token, '2026-10-01', 'MORNING_FASTING', 300); // Excluded

    const res = await request(app)
      .get('/api/reports/monthly?date=2026-10-15')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.date_range).toEqual({
      from: '2026-09-01',
      to: '2026-09-30',
    });
    // (90 + 140 + 110) / 3 = 340 / 3 = 113.333... -> 113.3
    expect(res.body.statistics).toEqual({
      highest: 140,
      lowest: 90,
      average: 113.3,
      total_readings: 3,
    });
  });

  test('4. Empty report returns 0 total_readings and null statistical values', async () => {
    const res = await request(app)
      .get('/api/reports/daily?date=2026-10-15')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.statistics).toEqual({
      highest: null,
      lowest: null,
      average: null,
      total_readings: 0,
    });
    expect(res.body.readings).toEqual([]);
  });

  test('5. Handles January -> December year rollover for previous monthly report', async () => {
    await seedReading(token, '2025-12-01', 'MORNING_FASTING', 100);
    await seedReading(token, '2025-12-31', 'AFTER_DINNER', 150);

    const res = await request(app)
      .get('/api/reports/monthly?date=2026-01-10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.date_range).toEqual({
      from: '2025-12-01',
      to: '2025-12-31',
    });
    expect(res.body.statistics).toEqual({
      highest: 150,
      lowest: 100,
      average: 125,
      total_readings: 2,
    });
  });
});
