import { emailService } from '../services/email.service.js';
import { tokenResetService } from '../services/resetToken.service.js';
import { userService } from '../services/user.service.js';
import { validate } from '../utils/validation.js';
import bcrypt from 'bcrypt';

const reset = async (req, res) => {
  const { email } = req.body;
  const emailError = validate.email(email);

  if (emailError) {
    return res.status(400).send({
      message: emailError,
    });
  }

  const userData = await userService.findByEmail(email);

  if (!userData) {
    return res.status(200).send({
      message: 'If an account exists, you will receive an email',
    });
  }

  const token = await tokenResetService.getByUserId(userData.id);
  const resetToken = tokenResetService.createToken();

  if (userData.activationToken !== null) {
    return res.status(400).send({
      message: 'Before reset password you have to confirm email',
    });
  }

  if (token) {
    try {
      tokenResetService.checkResetData(token);
    } catch (error) {
      return res.status(400).send({
        message: error.message,
      });
    }
  }

  try {
    const resetData = await tokenResetService.createOrUpdate(
      userData.id,
      resetToken,
    );

    await emailService.sendEmail({
      email,
      type: 'Reset',
      token: resetToken,
      id: resetData.id,
    });

    return res
      .status(200)
      .send({ message: 'If an account exists, you will receive an email' });
  } catch (error) {
    await tokenResetService.deleteResetToken(userData.id);

    if (error.code === 'P2025') {
      return res.status(404).send({ message: 'Reset token not found' });
    }

    if (error.code?.startsWith('P2')) {
      return res.status(500).send({ message: 'Database error' });
    }

    return res.status(400).send({ message: error.message });
  }
};

const resetCheck = async (req, res) => {
  const { token, tokenId } = req.params;

  if (!token || !tokenId) {
    return res.status(400).send({
      message: 'old or broken link',
    });
  }

  const tokenReset = await tokenResetService.getByTokenId(tokenId);

  if (!tokenReset || !tokenReset.resetTokenHash || !tokenReset.resetExpires) {
    return res.status(400).send({ message: 'old or broken link' });
  }

  if (tokenReset.resetExpires < new Date()) {
    return res.status(400).send({ message: 'old or broken link' });
  }

  try {
    await tokenResetService.checkPassword(token, tokenReset.resetTokenHash);
  } catch (error) {
    return res.status(400).send({
      message: error.message,
    });
  }

  try {
    await tokenResetService.deleteResetToken(tokenReset.userId);

    return res.status(200).send({
      userId: tokenReset.userId,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).send({ message: 'Reset token not found' });
    }

    if (error.code?.startsWith('P2')) {
      return res.status(500).send({ message: 'Database error' });
    }

    return res.status(400).send({ message: error.message });
  }
};

const resetConfirm = async (req, res) => {
  const { userId, password: pwd, confirmation } = req.body;

  if (!userId || !pwd || !confirmation) {
    return res.status(400).send({
      message: 'not found require params',
    });
  }

  const isError = validate.password(pwd);

  if (isError) {
    return res.status(400).send({
      message: isError,
    });
  }

  if (pwd.localeCompare(confirmation) !== 0) {
    return res.status(400).send({
      message: 'password and confirmation do not match',
    });
  }

  const userData = await userService.getByUserId(userId);

  if (!userData) {
    return res.status(400).send({
      message: 'not found require params',
    });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(pwd, saltRounds);

  try {
    await userService.update(userId, { password: hashedPassword });

    return res.status(200).send({
      message: 'Password changed, please login again',
    });
  } catch (error) {
    return res.status(400).send({
      message: error.message,
    });
  }
};

export const resetController = {
  reset,
  resetCheck,
  resetConfirm,
};
