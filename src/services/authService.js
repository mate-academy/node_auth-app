'use strict';

const AppError = require('../utils/AppError');
const { hashPassword, verifyPassword } = require('../utils/passwordHash');
const { createToken, hashToken } = require('../utils/token');
const {
  validateLogin,
  validateRegistration,
  validateReset,
} = require('../validators/authValidators');
const { isValidEmail, normalizeEmail } = require('../validators/common');

const ACTIVATION_TTL = 24 * 60 * 60 * 1000;
const RESET_TTL = 60 * 60 * 1000;

function createAuthService(users, mailer) {
  return {
    async register(data) {
      validateRegistration(data);

      const email = normalizeEmail(data.email);

      if (await users.findByEmail(email)) {
        throw new AppError(409, 'User with this email already exists');
      }

      const activationToken = createToken();
      const user = await users.create({
        name: data.name.trim(),
        email,
        passwordHash: await hashPassword(data.password),
        activationTokenHash: hashToken(activationToken),
        activationTokenExpiresAt: new Date(Date.now() + ACTIVATION_TTL),
      });

      await mailer.sendActivationEmail(email, activationToken);

      return user;
    },

    async activate(token) {
      const user = await users.findByActivationTokenHash(hashToken(token));

      if (!user) {
        throw new AppError(400, 'Activation token is invalid or expired');
      }

      user.isActive = true;
      user.activationTokenHash = null;
      user.activationTokenExpiresAt = null;
      await users.save(user);

      return user;
    },

    async login(data) {
      validateLogin(data);

      const user = await users.findByEmail(normalizeEmail(data.email));

      if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
        throw new AppError(401, 'Invalid email or password');
      }

      if (!user.isActive) {
        throw new AppError(403, 'Please activate your account first');
      }

      return user;
    },

    async requestPasswordReset(emailInput) {
      if (!isValidEmail(emailInput)) {
        throw new AppError(400, 'A valid email is required');
      }

      const user = await users.findByEmail(normalizeEmail(emailInput));

      if (!user) {
        return;
      }

      const resetToken = createToken();

      user.resetTokenHash = hashToken(resetToken);
      user.resetTokenExpiresAt = new Date(Date.now() + RESET_TTL);
      await users.save(user);
      await mailer.sendResetEmail(user.email, resetToken);
    },

    async resetPassword(token, data) {
      validateReset(data);

      const user = await users.findByResetTokenHash(hashToken(token));

      if (!user) {
        throw new AppError(400, 'Reset token is invalid or expired');
      }

      user.passwordHash = await hashPassword(data.password);
      user.resetTokenHash = null;
      user.resetTokenExpiresAt = null;
      await users.save(user);

      return user;
    },
  };
}

module.exports = createAuthService;
