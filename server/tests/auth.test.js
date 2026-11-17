const request = require('supertest');
const { createInMemoryPrisma } = require('./helpers/testDb');

const mockPrisma = createInMemoryPrisma();
jest.mock('../src/config/db', () => mockPrisma);

const app = require('../src/app');

describe('Authentication API (/api/auth)', () => {
  beforeEach(() => {
    mockPrisma.$Reset();
  });

  test('1. Successful user registration returns 201, sanitized user, and JWT token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice Johnson',
      email: 'alice@sweety.test',
      password: 'Password123!',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe('Alice Johnson');
    expect(res.body.user.email).toBe('alice@sweety.test');
    expect(res.body.user.password_hash).toBeUndefined();
    expect(typeof res.body.token).toBe('string');
  });

  test('2. Duplicate email registration is rejected with 409', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Alice Johnson',
      email: 'alice@sweety.test',
      password: 'Password123!',
    });

    const dupRes = await request(app).post('/api/auth/register').send({
      name: 'Alice Clone',
      email: 'ALICE@sweety.test',
      password: 'AnotherPassword123!',
    });

    expect(dupRes.statusCode).toBe(409);
    expect(dupRes.body.error).toMatch(/already exists/i);
  });

  test('3. Successful login returns 200 and JWT token', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Bob Smith',
      email: 'bob@sweety.test',
      password: 'SecretPassword99',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'bob@sweety.test',
      password: 'SecretPassword99',
    });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    expect(loginRes.body.user.email).toBe('bob@sweety.test');
    expect(loginRes.body.user.password_hash).toBeUndefined();
  });

  test('4. Login with incorrect password fails with 401', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Bob Smith',
      email: 'bob@sweety.test',
      password: 'SecretPassword99',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'bob@sweety.test',
      password: 'WrongPassword',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  test('5. Login or registration with missing credentials fails with 400', async () => {
    const loginMissing = await request(app).post('/api/auth/login').send({
      email: 'bob@sweety.test',
    });
    expect(loginMissing.statusCode).toBe(400);

    const regMissing = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'invalid-email',
      password: '',
    });
    expect(regMissing.statusCode).toBe(400);
  });

  test('6. Accessing protected routes without a valid token fails with 401', async () => {
    const noTokenRes = await request(app).get('/api/auth/me');
    expect(noTokenRes.statusCode).toBe(401);

    const badTokenRes = await request(app)
      .get('/api/readings')
      .set('Authorization', 'Bearer invalid.jwt.token');
    expect(badTokenRes.statusCode).toBe(401);
  });
});
