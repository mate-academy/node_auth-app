import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/emai.services.js';
import { Token } from '../models/token.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import { ApiError } from '../exceptions/api.error.js';
import { validatePassword } from '../utils/methods.js';

const requestReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.sendStatus(400);
    res.send('check your email');
  }

  const user = await userService.getByEmail(email);

  if (user) {
    const userData = userService.normalize(user);
    const resetToken = jwtService.generateResetPasswordToken(userData);

    // Store reset token using existing token service
    await tokenService.saveResetToken(user.id, resetToken);

    await emailService.sendResetPasswordEmail(email, resetToken);
  }

  return res.status(200).send({
    message:
      'If an account exists with this email, ' +
      'you will receive reset instructions',
  });
};

const resetPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    throw ApiError.badRequest('All field are required');
  }

  // Validate password match
  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  // Validate password strength
  const passwordError = validatePassword(password);

  if (passwordError) {
    throw ApiError.badRequest('Check your password');
  }

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.notFound('invalid attempt.');
  }

  const tokenRecord = await Token.findOne({
    where: {
      userId: user.id,
      resetToken: { [Op.ne]: null }, // check if reset token exist
    },
  });

  if (!tokenRecord) {
    throw ApiError.badRequest('Invalid reset token');
  }

  const newPassword = await bcrypt.hash(password, 10);

  // update password for user
  await User.update({ password: newPassword }, { where: { id: user.id } });

  // Remove used reset token
  await Token.update({ resetToken: null }, { where: { userId: user.id } });

  return res.status(200).json({
    message: 'Password successfully reset',
  });
};

export const resetController = {
  requestReset,
  resetPassword,
};
