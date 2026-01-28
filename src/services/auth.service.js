import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodeCrypto from 'crypto';
import { UniqueConstraintError } from 'sequelize';

import { User, Token } from '../models/index.js';
import { env } from '../config/env.js';
import { mailService } from './mail.service.js';
import { validatePassword } from '../utils/passwordRules.js';
import { tokenService } from './token.service.js';

function httpError(status, message, errors) {
  const err = new Error(message);

  err.status = status;

  if (errors) {
    err.errors = errors;
  }

  return err;
}

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export const authService = {
  async register({ name, email, password }) {
    const passwordErrors = validatePassword(password);

    if (passwordErrors.length) {
      throw httpError(400, 'Validation error', {
        password: passwordErrors.join(', '),
      });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        passwordHash,
      });

      const activationToken = await tokenService.createToken({
        userId: user.id,
        type: 'ACTIVATION',
        expiresInMs: 24 * 60 * 60 * 1000,
      });

      await mailService.sendActivationEmail(email, activationToken);
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw httpError(409, 'Email already exists', {
          email: 'Email already exists',
        });
      }
      throw e;
    }
  },

  async activate(rawToken) {
    const tokenHash = nodeCrypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const token = await Token.findOne({
      where: {
        tokenHash,
        type: 'ACTIVATION',
        consumedAt: null,
      },
      include: User,
    });

    if (!token || token.expiresAt < new Date()) {
      throw httpError(400, 'Invalid or expired token');
    }

    token.User.isActive = true;
    await token.User.save();

    token.consumedAt = new Date();
    await token.save();

    const jwtToken = signToken(token.User);

    return {
      token: jwtToken,
      user: {
        id: token.User.id,
        email: token.User.email,
        name: token.User.name,
      },
    };
  },

  async login({ email, password }) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw httpError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw httpError(403, 'Email not activated');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw httpError(401, 'Invalid credentials');
    }

    const token = signToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  },

  async resetPasswordRequest(email) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return;
    }

    const resetToken = await tokenService.createToken({
      userId: user.id,
      type: 'RESET_PASSWORD',
      expiresInMs: 60 * 60 * 1000,
    });

    await mailService.sendResetPasswordEmail(email, resetToken);
  },

  async resetPasswordConfirm(rawToken, { password }) {
    const passwordErrors = validatePassword(password);

    if (passwordErrors.length) {
      throw httpError(400, 'Validation error', {
        password: passwordErrors.join(', '),
      });
    }

    const tokenHash = nodeCrypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const token = await Token.findOne({
      where: {
        tokenHash,
        type: 'RESET_PASSWORD',
        consumedAt: null,
      },
      include: User,
    });

    if (!token || token.expiresAt < new Date()) {
      throw httpError(400, 'Invalid or expired token');
    }

    token.User.passwordHash = await bcrypt.hash(password, 10);
    await token.User.save();

    token.consumedAt = new Date();
    await token.save();
  },
};
