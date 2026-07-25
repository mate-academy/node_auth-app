'use strict';

const nodeCrypto = require('crypto');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { sendResetEmail } = require('../services/emailService');

const RESET_TOKEN_TTL = 60 * 60 * 1000; // 1 hour

async function forgotPassword(req, res) {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (user) {
    user.resetToken = nodeCrypto.randomUUID();
    user.resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_TTL);
    await user.save();

    await sendResetEmail(user.email, user.resetToken);
  }

  res.json({
    message: 'If this email is registered, a reset link has been sent',
  });
}

async function resetPassword(req, res) {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({ where: { resetToken: token } });

  if (!user || user.resetTokenExpiry < new Date()) {
    res.status(400).json({ message: 'Reset token is invalid or expired' });

    return;
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  res.json({ message: 'Password has been reset successfully' });
}

module.exports = {
  forgotPassword,
  resetPassword,
};
