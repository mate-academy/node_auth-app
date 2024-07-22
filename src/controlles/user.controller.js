const uuid4 = require('uuid4');
const { ApiError } = require('../exeptions/api.error.js');
const { emailService } = require('../services/email.service.js');
const { userService } = require('../services/user.service.js');
const { validateEmail, validatePassword } = require('./auth.controller.js');
const bcrypt = require('bcrypt');

const verifyRefreshToken = async (userId, refreshToken) => {
  const tokenRecord = await userService.getUserToken(userId);

  if (!tokenRecord) {
    throw ApiError.unauthorized();
  }

  if (tokenRecord.dataValues.refreshToken !== refreshToken) {
    throw ApiError.unauthorized();
  }
};

const userProfile = async (req, res) => {
  const { id } = req.params;
  const { refreshToken } = req.cookies;

  await verifyRefreshToken(id, refreshToken);

  const user = await userService.getUser(id);
  const name = user.name;

  res.send(`Hello ${name}`);
};

const changeName = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const { refreshToken } = req.cookies;

  await verifyRefreshToken(id, refreshToken);

  const user = await userService.getUser(id);

  user.name = name;
  await user.save();

  res.send({ ...userService.normalize(user), name });
};

const changePassword = async (req, res) => {
  const { id } = req.params;
  const { password, newPassword, confirmation } = req.body;
  const { refreshToken } = req.cookies;

  await verifyRefreshToken(id, refreshToken);

  const user = await userService.getUser(id);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Incorrect password.');
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest(
      `Passwords do not match.
      Please make sure both password fields are the same.`,
    );
  }

  if (!validatePassword(password)) {
    throw ApiError.badRequest(
      `Incorrect password.
      The length of the fault must be at least 6 characters`,
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  res.send('Password has been reset successfully');
};

const changeEmail = async (req, res) => {
  const { id } = req.params;
  const { newEmail, password } = req.body;
  const { refreshToken } = req.cookies;

  await verifyRefreshToken(id, refreshToken);

  if (!validateEmail(newEmail)) {
    throw ApiError.badRequest(
      `Invalid email address.
      Please enter a valid email address in the format "example@example.com".`
    );
  }

  const user = await userService.getUser(id);
  const email = user.email;
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const existUser = await userService.findByEmail(newEmail);

  if (existUser) {
    throw ApiError.badRequest('User Already exist', {
      email: 'User already exist',
    });
  }

  const activationToken = uuid4();

  user.email = newEmail;
  user.activationToken = activationToken;
  user.save();

  await emailService.sendActivationEmail(newEmail, activationToken);
  await emailService.changeEmail(email, newEmail);

  res.send(user);
};

const userController = {
  user: userProfile,
  changeName,
  changePassword,
  changeEmail,
};

module.exports = {
  userController,
  verifyRefreshToken,
};
