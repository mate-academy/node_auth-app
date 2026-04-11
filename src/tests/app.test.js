'use strict';

const request = require('supertest');
const app = require('../app');
const { User } = require('../models/User');

beforeEach(() => {
  User.reset();
});

afterAll(() => {
  User.reset();
});

describe('Auth Routes', () => {
  describe('GET /auth/register', () => {
    it('should render register page', async () => {
      const res = await request(app).get('/auth/register');

      expect(res.status).toBe(200);
      expect(res.text).toContain('Register');
    });
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password1!',
        confirmation: 'Password1!',
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Registration Successful');
    });

    it('should reject duplicate email', async () => {
      await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password1!',
        confirmation: 'Password1!',
      });

      const res = await request(app).post('/auth/register').send({
        name: 'Another User',
        email: 'test@example.com',
        password: 'Password2@',
        confirmation: 'Password2@',
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('already registered');
    });

    it('should reject mismatched passwords', async () => {
      const res = await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password1!',
        confirmation: 'Different1!',
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('do not match');
    });

    it('should reject weak password', async () => {
      const res = await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak',
        confirmation: 'weak',
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('at least 8 characters');
    });

    it('should reject empty name', async () => {
      const res = await request(app).post('/auth/register').send({
        name: '',
        email: 'test@example.com',
        password: 'Password1!',
        confirmation: 'Password1!',
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Name is required');
    });

    it('should reject invalid email', async () => {
      const res = await request(app).post('/auth/register').send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password1!',
        confirmation: 'Password1!',
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Valid email');
    });
  });

  describe('GET /auth/login', () => {
    it('should render login page', async () => {
      const res = await request(app).get('/auth/login');

      expect(res.status).toBe(200);
      expect(res.text).toContain('Login');
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const { activationToken } = User.create({
        name: 'Test',
        email: 'test@example.com',
        password: 'Password1!',
      });

      User.activate(activationToken);

      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'Password1!',
      });

      expect(res.status).toBe(302);
      expect(res.header.location).toBe('/profile');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Invalid email or password');
    });

    it('should reject inactive user', async () => {
      User.create({
        name: 'Test',
        email: 'test@example.com',
        password: 'Password1!',
      });

      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'Password1!',
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('activate your account');
    });
  });

  describe('GET /auth/activate/:token', () => {
    it('should activate user with valid token', async () => {
      const { activationToken } = User.create({
        name: 'Test',
        email: 'test@example.com',
        password: 'Password1!',
      });

      const res = await request(app).get(`/auth/activate/${activationToken}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain('activated successfully');
    });

    it('should reject invalid activation token', async () => {
      const res = await request(app).get('/auth/activate/invalid-token');

      expect(res.status).toBe(200);
      expect(res.text).toContain('Activation Failed');
    });
  });

  describe('POST /auth/logout', () => {
    it('should redirect to login when not authenticated', async () => {
      const res = await request(app).post('/auth/logout');

      expect(res.status).toBe(302);
      expect(res.header.location).toBe('/auth/login');
    });

    it('should logout authenticated user', async () => {
      const { activationToken } = User.create({
        name: 'Test',
        email: 'test@example.com',
        password: 'Password1!',
      });

      User.activate(activationToken);

      const loginRes = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'Password1!',
      });

      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app)
        .post('/auth/logout')
        .set('Cookie', cookies);

      expect(res.status).toBe(302);
      expect(res.header.location).toBe('/auth/login');
    });
  });
});

describe('Password Reset Routes', () => {
  describe('GET /password/reset', () => {
    it('should render reset request page', async () => {
      const res = await request(app).get('/password/reset');

      expect(res.status).toBe(200);
      expect(res.text).toContain('Reset Password');
    });
  });

  describe('POST /password/reset', () => {
    it('should show sent page for any email', async () => {
      const res = await request(app).post('/password/reset').send({
        email: 'test@example.com',
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Email Sent');
    });

    it('should reject invalid email', async () => {
      const res = await request(app).post('/password/reset').send({
        email: 'invalid',
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Valid email');
    });
  });

  describe('GET /password/reset/:token', () => {
    it('should render reset confirm page', async () => {
      const res = await request(app).get('/password/reset/some-token');

      expect(res.status).toBe(200);
      expect(res.text).toContain('Set New Password');
    });
  });

  describe('POST /password/reset/:token', () => {
    it('should reset password with valid token', async () => {
      User.create({
        name: 'Test',
        email: 'test@example.com',
        password: 'Password1!',
      });

      const token = User.createResetToken('test@example.com');

      const res = await request(app).post(`/password/reset/${token}`).send({
        password: 'NewPassword1!',
        confirmation: 'NewPassword1!',
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Password Reset Successful');
    });

    it('should reject mismatched passwords', async () => {
      const res = await request(app).post('/password/reset/some-token').send({
        password: 'NewPassword1!',
        confirmation: 'Different1!',
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain('do not match');
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .post('/password/reset/invalid-token')
        .send({
          password: 'NewPassword1!',
          confirmation: 'NewPassword1!',
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Invalid or expired');
    });
  });
});

describe('Profile Routes', () => {
  let cookies;

  function setupAuthenticatedUser() {
    const { activationToken } = User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1!',
    });

    User.activate(activationToken);
  }

  async function loginUser() {
    const loginRes = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'Password1!',
    });

    cookies = loginRes.headers['set-cookie'];

    return cookies;
  }

  beforeEach(() => {
    User.reset();
    setupAuthenticatedUser();
  });

  beforeEach(async () => {
    await loginUser();
  });

  describe('GET /profile', () => {
    it('should render profile page for authenticated user', async () => {
      const res = await request(app).get('/profile').set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.text).toContain('Profile');
      expect(res.text).toContain('Test User');
    });

    it('should redirect to login when not authenticated', async () => {
      const res = await request(app).get('/profile');

      expect(res.status).toBe(302);
      expect(res.header.location).toBe('/auth/login');
    });
  });

  describe('POST /profile/name', () => {
    it('should update name', async () => {
      const res = await request(app)
        .post('/profile/name')
        .set('Cookie', cookies)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Updated Name');
      expect(res.text).toContain('Name updated successfully');
    });

    it('should reject empty name', async () => {
      const res = await request(app)
        .post('/profile/name')
        .set('Cookie', cookies)
        .send({ name: '' });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Name is required');
    });
  });

  describe('POST /profile/password', () => {
    it('should update password with correct old password', async () => {
      const res = await request(app)
        .post('/profile/password')
        .set('Cookie', cookies)
        .send({
          oldPassword: 'Password1!',
          newPassword: 'NewPassword2@',
          confirmation: 'NewPassword2@',
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Password updated successfully');
    });

    it('should reject wrong old password', async () => {
      const res = await request(app)
        .post('/profile/password')
        .set('Cookie', cookies)
        .send({
          oldPassword: 'WrongPassword1!',
          newPassword: 'NewPassword2@',
          confirmation: 'NewPassword2@',
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Current password is incorrect');
    });

    it('should reject mismatched new passwords', async () => {
      const res = await request(app)
        .post('/profile/password')
        .set('Cookie', cookies)
        .send({
          oldPassword: 'Password1!',
          newPassword: 'NewPassword2@',
          confirmation: 'Different2@',
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain('do not match');
    });
  });

  describe('POST /profile/email', () => {
    it('should update email with correct password', async () => {
      const res = await request(app)
        .post('/profile/email')
        .set('Cookie', cookies)
        .send({
          password: 'Password1!',
          newEmail: 'newemail@example.com',
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Email updated successfully');
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/profile/email')
        .set('Cookie', cookies)
        .send({
          password: 'WrongPassword1!',
          newEmail: 'newemail@example.com',
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Password is incorrect');
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/profile/email')
        .set('Cookie', cookies)
        .send({
          password: 'Password1!',
          newEmail: 'invalid-email',
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain('Valid email');
    });
  });
});

describe('404 Page', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/nonexistent-page');

    expect(res.status).toBe(404);
    expect(res.text).toContain('Not Found');
  });
});
