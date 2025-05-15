const bcrypt = require('bcrypt');
const { ApiError } = require('../exceptions/api.error.js');
const { authService } = require('../services/auth.service.js');
const { emailService } = require('../services/email.service.js');
const { jwtService } = require('../services/jwt.service.js');
const { userService } = require('../services/user.service.js');

async function getProfileInfo(req, res) {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  res.send(userService.normalize(user));
}

async function changeName(req, res) {
  const { name } = req.body;
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  user.name = name;
  await user.save();

  res.send(userService.normalize(user));
}

async function changePassword(req, res) {
  const { password, newPassword, confirmation } = req.body;

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Wrong confirmation');
  }

  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const error = authService.validatePassword(newPassword);

  if (error) {
    throw ApiError.badRequest('Validation error', { error });
  }

  const hashedPassword = await authService.hashPassword(newPassword);

  user.password = hashedPassword;
  await user.save();

  res.sendStatus(204);
}

async function changeEmail(req, res) {
  const { password, newEmail } = req.body;

  if (!password) {
    throw ApiError.badRequest('Bad request');
  }

  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userData.email);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const error = authService.validateEmail(newEmail);

  if (error) {
    throw ApiError.badRequest('Validation error', { error });
  }

  const subject = 'Email changes';
  const html = `<p>Email in your profile has been changed to ${newEmail}</p>`;

  await emailService.send({ email: user.email, subject, html });

  user.email = newEmail;
  await user.save();

  res.send(userService.normalize(user));
}

exports.profileController = {
  getProfileInfo,
  changeName,
  changePassword,
  changeEmail,
};
