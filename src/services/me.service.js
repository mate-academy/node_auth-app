import bcrypt from 'bcrypt';
import nodeCrypto from 'crypto';
import { UniqueConstraintError } from 'sequelize';

import { User, Token } from '../models/index.js';
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

export const meService = {
  async getProfile(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw httpError(404, 'User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    };
  },

  async updateName(userId, name) {
    if (!name || String(name).trim().length === 0) {
      throw httpError(400, 'Validation error', { name: 'Name is required' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      throw httpError(404, 'User not found');
    }

    user.name = String(name).trim();
    await user.save();

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    };
  },

  async updatePassword(userId, { oldPassword, newPassword, confirmation }) {
    if (!oldPassword) {
      throw httpError(400, 'Validation error', {
        oldPassword: 'Old password is required',
      });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      throw httpError(400, 'Validation error', {
        newPassword: 'New password is required',
      });
    }

    const passwordErrors = validatePassword(newPassword);

    if (passwordErrors.length) {
      throw httpError(400, 'Validation error', {
        newPassword: passwordErrors.join(', '),
      });
    }

    if (newPassword !== confirmation) {
      throw httpError(400, 'Validation error', {
        confirmation: 'Passwords do not match',
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      throw httpError(404, 'User not found');
    }

    const ok = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!ok) {
      throw httpError(400, 'Invalid old password');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
  },

  async changeEmailRequest(userId, { password, newEmail, confirmation }) {
    if (!password) {
      throw httpError(400, 'Validation error', {
        password: 'Password is required',
      });
    }

    if (!newEmail) {
      throw httpError(400, 'Validation error', {
        newEmail: 'New email is required',
      });
    }

    if (newEmail !== confirmation) {
      throw httpError(400, 'Validation error', {
        confirmation: 'Emails do not match',
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      throw httpError(404, 'User not found');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      throw httpError(400, 'Invalid password');
    }

    const newEmailNormalized = String(newEmail).toLowerCase().trim();

    user.pendingEmail = newEmailNormalized;
    await user.save();

    const changeToken = await tokenService.createToken({
      userId: user.id,
      type: 'CHANGE_EMAIL',
      expiresInMs: 24 * 60 * 60 * 1000,
      meta: { newEmail: newEmailNormalized },
    });

    await mailService.sendChangeEmailConfirm(newEmailNormalized, changeToken);
    await mailService.sendChangeEmailNotifyOld(user.email, newEmailNormalized);
  },

  async confirmEmailChange(rawToken) {
    const tokenHash = nodeCrypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const token = await Token.findOne({
      where: {
        tokenHash,
        type: 'CHANGE_EMAIL',
        consumedAt: null,
      },
      include: User,
    });

    if (!token || token.expiresAt < new Date()) {
      throw httpError(400, 'Invalid or expired token');
    }

    const user = token.User;
    const newEmail = token.meta?.newEmail || user.pendingEmail;

    if (!newEmail) {
      throw httpError(400, 'No email to confirm');
    }

    try {
      user.email = String(newEmail).toLowerCase().trim();
      user.pendingEmail = null;
      await user.save();
    } catch (e) {
      if (e instanceof UniqueConstraintError) {
        throw httpError(409, 'Email already in use');
      }
      throw e;
    }

    token.consumedAt = new Date();
    await token.save();
  },
};
