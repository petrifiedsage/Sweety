const request = require('supertest');
const { createInMemoryPrisma } = require('./helpers/testDb');

const mockPrisma = createInMemoryPrisma();
jest.mock('../src/config/db', () => mockPrisma);

const app = require('../src/app');

describe('Reading Management & Business Rules (/api/readings)', () => {
  let userAToken;
  let userBToken;

  beforeEach(async () => {
    mockPrisma.$Reset();

    const resA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'usera@sweety.test',
      password: 'Password123!',
    });
    userAToken = resA.body.token;

    const resB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'userb@sweety.test',
      password: 'Password123!',
    });
    userBToken = resB.body.token;
  });

  test('1. Create a valid reading returns 201 and formatted reading', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'AFTER_LUNCH',
        glucose_value: 160,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.reading).toMatchObject({
      reading_date: '2026-10-15',
      time_slot: 'AFTER_LUNCH',
      time_slot_label: 'After lunch',
      glucose_value: 160,
    });
  });

  test('2. BR-01: Reject empty glucose value with exact error message', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'MORNING_FASTING',
        glucose_value: '',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Please enter a glucose value.');
  });

  test('3. BR-02: Reject glucose values below 40', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'MORNING_FASTING',
        glucose_value: 39,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Value must be between 40 and 600 mg/dl.');
  });

  test('4. BR-02: Reject glucose values above 600', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'MORNING_FASTING',
        glucose_value: 601,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Value must be between 40 and 600 mg/dl.');
  });

  test('5. BR-02: Reject decimal and non-numeric glucose values', async () => {
    const decimalRes = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'MORNING_FASTING',
        glucose_value: 120.5,
      });

    expect(decimalRes.statusCode).toBe(400);
    expect(decimalRes.body.error).toBe('Value must be between 40 and 600 mg/dl.');

    const stringRes = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'MORNING_FASTING',
        glucose_value: 'abc',
      });

    expect(stringRes.statusCode).toBe(400);
    expect(stringRes.body.error).toBe('Value must be between 40 and 600 mg/dl.');
  });

  test('6. BR-03: Reject duplicate slot on the same date with exact error message', async () => {
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'AFTER_LUNCH',
        glucose_value: 160,
      });

    const dupRes = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'AFTER_LUNCH',
        glucose_value: 145,
      });

    expect(dupRes.statusCode).toBe(409);
    expect(dupRes.body.error).toBe(
      'You already have an After lunch reading for this date.'
    );
  });

  test('7. BR-04: Reject more than 4 readings per day with exact error message', async () => {
    const slots = [
      'MORNING_FASTING',
      'AFTER_BREAKFAST',
      'AFTER_LUNCH',
      'AFTER_DINNER',
    ];

    for (const slot of slots) {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          reading_date: '2026-10-15',
          time_slot: slot,
          glucose_value: 110,
        });
      expect(res.statusCode).toBe(201);
    }

    const fifthRes = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'AFTER_LUNCH',
        glucose_value: 130,
      });

    expect(fifthRes.statusCode).toBe(409);
    expect(fifthRes.body.error).toBe('You can add only 4 readings per day.');
  });

  test('8. BR-05: Reject future dates with exact error message', async () => {
    const res = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        reading_date: '2099-12-31',
        time_slot: 'MORNING_FASTING',
        glucose_value: 100,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Date cannot be in the future.');
  });

  test('9. BR-07: Successfully edit a reading without triggering false duplicate against itself', async () => {
    const created = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'MORNING_FASTING',
        glucose_value: 95,
      });

    const readingId = created.body.reading.id;

    const updated = await request(app)
      .put(`/api/readings/${readingId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'MORNING_FASTING',
        glucose_value: 108,
      });

    expect(updated.statusCode).toBe(200);
    expect(updated.body.reading.glucose_value).toBe(108);
  });

  test('10. Successfully delete a reading', async () => {
    const created = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'MORNING_FASTING',
        glucose_value: 95,
      });

    const readingId = created.body.reading.id;

    const delRes = await request(app)
      .delete(`/api/readings/${readingId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(delRes.statusCode).toBe(200);

    const getRes = await request(app)
      .get(`/api/readings/${readingId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(getRes.statusCode).toBe(404);
  });

  test("11. BR-06: Prevent access, editing, or deletion of another user's records", async () => {
    const createdByA = await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'MORNING_FASTING',
        glucose_value: 95,
      });

    const readingId = createdByA.body.reading.id;

    const viewByB = await request(app)
      .get(`/api/readings/${readingId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(viewByB.statusCode).toBe(403);

    const editByB = await request(app)
      .put(`/api/readings/${readingId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        reading_date: '2026-10-15',
        time_slot: 'MORNING_FASTING',
        glucose_value: 200,
      });
    expect(editByB.statusCode).toBe(403);

    const deleteByB = await request(app)
      .delete(`/api/readings/${readingId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(deleteByB.statusCode).toBe(403);
  });
});
