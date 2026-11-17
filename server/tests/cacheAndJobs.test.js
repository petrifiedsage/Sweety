const request = require('supertest');
const { createInMemoryPrisma } = require('./helpers/testDb');

const mockPrisma = createInMemoryPrisma();
jest.mock('../src/config/db', () => mockPrisma);

const app = require('../src/app');
const cacheService = require('../src/services/cacheService');

describe('Redis Report Caching & BullMQ Reminder Jobs', () => {
  let token;

  beforeEach(async () => {
    mockPrisma.$Reset();
    cacheService.clearAllCache();

    const res = await request(app).post('/api/auth/register').send({
      name: 'Cache Test User',
      email: 'cache@sweety.test',
      password: 'Password123!',
    });
    token = res.body.token;
  });

  test('1. Report endpoint returns X-Cache: MISS on first request and X-Cache: HIT on second request', async () => {
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'MORNING_FASTING',
        glucose_value: 95,
      });

    const firstRes = await request(app)
      .get('/api/reports/daily?date=2026-10-15')
      .set('Authorization', `Bearer ${token}`);

    expect(firstRes.statusCode).toBe(200);
    expect(firstRes.body.cached).toBe(false);
    expect(firstRes.headers['x-cache']).toBe('MISS');

    const secondRes = await request(app)
      .get('/api/reports/daily?date=2026-10-15')
      .set('Authorization', `Bearer ${token}`);

    expect(secondRes.statusCode).toBe(200);
    expect(secondRes.body.cached).toBe(true);
    expect(secondRes.headers['x-cache']).toBe('HIT');
    expect(secondRes.body.statistics.highest).toBe(95);
  });

  test('2. Creating, updating, or deleting a reading invalidates the user report cache immediately', async () => {
    const createRes = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'MORNING_FASTING',
        glucose_value: 100,
      });

    const readingId = createRes.body.reading.id;

    // Prime the cache (MISS)
    await request(app)
      .get('/api/reports/daily?date=2026-10-15')
      .set('Authorization', `Bearer ${token}`);

    // Verify cache HIT
    const hitRes = await request(app)
      .get('/api/reports/daily?date=2026-10-15')
      .set('Authorization', `Bearer ${token}`);
    expect(hitRes.body.cached).toBe(true);

    // Update the reading -> should invalidate report cache
    await request(app)
      .put(`/api/readings/${readingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'MORNING_FASTING',
        glucose_value: 140,
      });

    const afterUpdateReport = await request(app)
      .get('/api/reports/daily?date=2026-10-15')
      .set('Authorization', `Bearer ${token}`);

    expect(afterUpdateReport.body.cached).toBe(false);
    expect(afterUpdateReport.headers['x-cache']).toBe('MISS');
    expect(afterUpdateReport.body.statistics.highest).toBe(140);
  });

  test('3. BullMQ Daily Reminder job identifies logged and missing meal slots for a date', async () => {
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'MORNING_FASTING',
        glucose_value: 95,
      });

    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'AFTER_BREAKFAST',
        glucose_value: 120,
      });

    const triggerRes = await request(app)
      .post('/api/jobs/reminders/trigger')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-10-15' });

    expect(triggerRes.statusCode).toBe(200);
    expect(triggerRes.body.reminder).toMatchObject({
      date: '2026-10-15',
      logged_count: 2,
      missing_count: 2,
      is_complete: false,
    });
    expect(triggerRes.body.reminder.missing_slots.map((s) => s.code)).toEqual([
      'AFTER_LUNCH',
      'AFTER_DINNER',
    ]);
  });
});
