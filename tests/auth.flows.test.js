// tests/auth.flows.test.js
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/services/prisma');

describe('Auth & Profile flows', () => {
  beforeAll(async () => {
    await prisma.$executeRawUnsafe('DELETE FROM "PasswordReset";');
    await prisma.$executeRawUnsafe('DELETE FROM "User";');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('register -> activate -> login redirects to /profile', async () => {
    const email = 'user@example.com';
    await request(app).post('/auth/register').send({ name: 'U', email, password: 'Secret123!' }).expect(201);

    const u = await prisma.user.findUnique({ where: { email } });
    const resActivate = await request(app).post('/auth/activate').query({ token: u.activationToken }).send();
    expect(resActivate.status).toBe(302);
    expect(resActivate.headers.location).toBe('/profile');

    const resLogin = await request(app).post('/auth/login').send({ email, password: 'Secret123!' });
    expect(resLogin.status).toBe(302);
    expect(resLogin.headers.location).toBe('/profile');
  });

  it('password reset request/confirm', async () => {
    const email = 'user2@example.com';
    await request(app).post('/auth/register').send({ name: 'U2', email, password: 'OldPass123!' });
    const u = await prisma.user.findUnique({ where: { email } });
    await prisma.user.update({ where: { id: u.id }, data: { isActive: true } });

    await request(app).post('/auth/password-reset').send({ email }).expect(202);

    const pr = await prisma.passwordReset.findFirst({ where: { userId: u.id } });
    await request(app).post('/auth/password-reset/confirm').send({ token: pr.token, newPassword: 'NewPass123!' }).expect(200);
  });
});
