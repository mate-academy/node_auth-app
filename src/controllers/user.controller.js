const { ApiError } = require('../exeptions/api.error.js');
const { User } = require('../models/user.js');
const { emailService } = require('../services/email.service.js');
const { userService } = require('../services/user.service.js');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such email');
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;
  await user.save();

  await emailService.sendResetPasswordEmail(email, resetToken);

  res.send({ message: 'Password reset email sent successfully' });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = await User.findOne({ where: { resetToken: token } });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  user.password = hashPassword;
  user.resetToken = null;
  await user.save();

  res.send({ message: 'Password has been successfully reset' });
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.name = name;
  await user.save();
  res.send({ message: 'Name successfully updated', user });
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const userId = req.user.id;

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('New passwords do not match');
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid old password');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.send({ message: 'Password successfully changed' });
};

const changeEmail = async (req, res) => {
  const { password, newEmail, confirmEmail } = req.body;

  if (newEmail !== confirmEmail) {
    throw ApiError.badRequest('New emails do not match');
  }

  const userId = req.user.id;

  const user = await User.findByPk(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid password');
  }

  const oldEmail = user.email;

  user.email = newEmail;
  await user.save();

  await emailService.sendEmailChangedNotification(oldEmail, newEmail);

  res.send({ message: 'Email successfully changed' });
};

module.exports = {
  forgotPassword,
  resetPassword,
  updateName,
  changeEmail,
  changePassword,
};
