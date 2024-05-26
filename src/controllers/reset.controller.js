'use strict';

const { ApiError } = require('../exeptions/api.error');
const { sendMail } = require('../services/sendMail');
const { token } = require('../services/token');
const bcrypt = require('bcrypt');
const { isValidatedPassword } = require('../utils/isValidatedPassword.js');
const { findUserByEmail, findUserById } = require('../services/user.service');

async function resetPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    throw ApiError.badRequest({ message: 'Invalid email' });
  }

  const user = await findUserByEmail(email);

  const resetToken = token.getToken(
    { password: user.password },
    'resetPassword',
  );
  const url = `http://localhost:3005/reset/password/${resetToken}`;

  await sendMail(email, url);

  user.resetPasswordToken = resetToken;
  await user.save();

  res.status(200).send('reset link has been sent to email');
}

async function resetPasswordWithToken(req, res) {
  const { resetToken } = req.params;

  const user = await findUserByEmail({ resetPasswordToken: resetToken });

  res.send(`
    <form action="/reset/password/${user.id}" method="POST">
      <input type="password" name="password" placeholder="New password" required />
      <input type="password" name="confirmPassword" placeholder="Confirm new password" required />
      <button type="submit">Reset Password</button>
    </form>
  `);
}

async function resetPasswordData(req, res) {
  const { password, confirmPassword } = req.body;
  const { userId } = req.params;

  const user = await findUserById(userId);

  if (password !== confirmPassword) {
    throw ApiError.badRequest({ message: 'password is not equal' });
  }

  if (!isValidatedPassword(password)) {
    throw ApiError.badRequest({ message: 'password not strong' });
  }

  const hashPassword = await bcrypt.hash(password, 3);

  user.password = hashPassword;
  user.save();

  res.send(`
    <h1>Password reseted succesfully</h1>
    <p>Go to <a href='http://localhost:3005/login'>login page</a>.</p>
  `);
}

module.exports = {
  resetController: {
    resetPassword,
    resetPasswordWithToken,
    resetPasswordData,
  },
};
