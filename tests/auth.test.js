'use strict';

const createAuthService = require('../src/services/authService');
const createProfileService = require('../src/services/profileService');
const { verifyPassword } = require('../src/utils/passwordHash');
const { isStrongPassword } = require('../src/utils/passwordRules');
const { createMemoryAdapters } = require('../quality/helpers');

describe('authentication domain', () => {
  test('registers inactive user and sends activation email', async () => {
    const adapters = createMemoryAdapters();
    const auth = createAuthService(adapters.users, adapters.mailer);
    const user = await auth.register({
      name: 'Joel',
      email: 'JOEL@example.com',
      password: 'Strong#123',
    });

    expect(user.email).toBe('joel@example.com');
    expect(user.isActive).toBe(false);
    expect(adapters.mailer.getOutbox()[0].type).toBe('activation');
  });

  test('requires activation before login', async () => {
    const adapters = createMemoryAdapters();
    const auth = createAuthService(adapters.users, adapters.mailer);

    await auth.register({
      name: 'Joel',
      email: 'joel@example.com',
      password: 'Strong#123',
    });

    await expect(
      auth.login({
        email: 'joel@example.com',
        password: 'Strong#123',
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('resets password only when confirmation matches', async () => {
    const adapters = createMemoryAdapters();
    const auth = createAuthService(adapters.users, adapters.mailer);
    const user = await auth.register({
      name: 'Joel',
      email: 'joel@example.com',
      password: 'Strong#123',
    });

    await auth.requestPasswordReset('joel@example.com');
    const reset = adapters.mailer
      .getOutbox()
      .find((message) => message.type === 'reset');

    await auth.resetPassword(reset.token, {
      password: 'Better#456',
      confirmation: 'Better#456',
    });

    expect(await verifyPassword('Better#456', user.passwordHash)).toBe(true);
  });

  test('requires matching new email and notifies old email', async () => {
    const adapters = createMemoryAdapters();
    const auth = createAuthService(adapters.users, adapters.mailer);
    const profile = createProfileService(
      adapters.users,
      adapters.sessions,
      adapters.mailer,
    );
    const user = await auth.register({
      name: 'Joel',
      email: 'old@example.com',
      password: 'Strong#123',
    });

    await expect(
      profile.updateEmail(user, {
        email: 'new@example.com',
        emailConfirmation: 'wrong@example.com',
        password: 'Strong#123',
      }),
    ).rejects.toMatchObject({ statusCode: 400 });

    await profile.updateEmail(user, {
      email: 'new@example.com',
      emailConfirmation: 'new@example.com',
      password: 'Strong#123',
    });

    expect(user.email).toBe('new@example.com');
    expect(
      adapters.mailer
        .getOutbox()
        .some((message) => message.type === 'email-change'),
    ).toBe(true);
  });

  test('documents and enforces a strong password policy', () => {
    expect(isStrongPassword('weak')).toBe(false);
    expect(isStrongPassword('Strong#123')).toBe(true);
  });
});
