import bcrypt from 'bcrypt';
import { checkPasswordMatch } from '../utils/checkPasswordMatch.js';
import * as validation from '../utils/validators.js';
import * as resetService from '../services/resetToken.service.js';
import * as refreshService from '../services/refreshToken.service.js';
import * as userService from '../services/user.service.js';
import { sendActivationEmail, sendResetEmail } from '../utils/mailer.js';
import { normalizeEmail } from '../utils/normalizeEmail';

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const normalizedEmail = normalizeEmail(email);
  const validaterAnswer = validation.validateEmail(normalizedEmail);

  if (validaterAnswer) {
    res.status(400).json({ message: validaterAnswer });

    return;
  }

  const user = await userService.getByEmail(normalizedEmail);

  if (user) {
    if (user.isActive === false) {
      let activationToken = user.activationToken;

      if (!activationToken) {
        activationToken = crypto.randomBytes(48).toString('hex');

        await userService.update(user.id, { activationToken });
      }
      await sendActivationEmail(user.email, activationToken);
    } else {
      const token = await resetService.generateResetToken(user.id);

      await sendResetEmail(user.email, token);
    }
  }

  res.json({
    message: 'If an account with this email exists, we sent you an email',
  });
};

export const resetPassword = async (req, res) => {
  const { password, confirmation, token } = req.body ?? {};

  if (typeof token !== 'string') {
    return res.status(400).json({
      message: 'Invalid token type',
    });
  }

  const checkPassword = checkPasswordMatch(password, confirmation);

  if (typeof checkPassword === 'string') {
    return res.status(400).json({
      message: checkPassword,
    });
  }

  const userId = await resetService.consumeResetToken(token);

  if (userId === null) {
    return res
      .status(404)
      .json({ message: 'Token is invalid or already used' });
  }

  const newPassword = await bcrypt.hash(password, 10);

  await userService.update(userId, {
    passwordHash: newPassword,
  });
  await refreshService.removeAllUserTokens(userId);

  res.status(200).json({ message: 'Password has been reset' });
};
