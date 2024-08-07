const { ApiError } = require('../exceptions/api.error');
const emailService = require('../services/email.service');
const jwtService = require('../services/jwt.service');
const tokenService = require('../services/token.service');
const userService = require('../services/user.service');

const getAllActive = async (req, res) => {
  const users = await userService.getAllActive();

  res.send(users.map(userService.normalize));
};

const getProfile = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.send(userData);
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const { refreshToken } = req.cookies;

  const validationError = userService.validateName(name);

  if (validationError) {
    throw ApiError.BadRequest('Validation error', { name: validationError });
  }

  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const tokenFromDB = await tokenService.getByToken(refreshToken);

  if (!tokenFromDB) {
    throw ApiError.Unauthorized();
  }

  await userService.updateName(tokenFromDB.userId);

  // res.send(userService.normalize(user));

  res.status(200).send({ message: 'Name updated successfully' });
};

const updateEmail = async (req, res) => {
  const { refreshToken } = req.cookies;
  const { password, email } = req.body;

  const errors = {
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const tokenFromDB = await tokenService.getByToken(refreshToken);

  if (!tokenFromDB) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.findById(userData.id);
  const oldEmail = user.email;

  await userService.updateEmail(email, user.id);

  await emailService.notifyOldEmail(user.name, email, oldEmail);

  // res.send(userService.normalize(user));

  res.status(200).send({ message: 'Email updated successfully' });
};

const updatePassword = async (req, res) => {
  const { password, newPassword, confirmation } = req.body;
  const { refreshToken } = req.cookies;

  const validationError = userService.validatePassword(newPassword);

  if (validationError) {
    throw ApiError.BadRequest(validationError);
  }

  if (newPassword !== confirmation) {
    throw ApiError.BadRequest('Incorrect data', {
      confirmation: `Passwords do not match`,
    });
  }

  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const tokenFromDB = await tokenService.getByToken(refreshToken);

  if (!tokenFromDB) {
    throw ApiError.Unauthorized();
  }

  const user = userService.findById(userData.id);

  const isPasswordValid = await userService.comparePasswords(
    password,
    user.password,
  );

  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid password');
  }

  await userService.updatePassword(tokenFromDB.userId, newPassword);

  res.sendStatus(200);
};

module.exports = {
  getProfile,
  getAllActive,
  updateName,
  updateEmail,
  updatePassword,
};
