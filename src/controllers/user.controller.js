const { ApiError } = require('../exceptions/api.error');
const emailService = require('../services/email.service');
const jwtService = require('../services/jwt.service');
const tokenService = require('../services/token.service');
const userService = require('../services/user.service');
const {
  validateName,
  validateEmail,
  validatePassword,
  comparePasswords,
} = require('../utils');

const getAllActive = async (req, res) => {
  const users = await userService.getAllActive();

  res.send(users.map(userService.normalize));
};

const getProfile = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = await jwtService.validateRefreshToken(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.Unauthorized();
  }

  const user = await userService.findByEmail(userData.email);

  if (!user || token.userId !== user.id) {
    throw ApiError.Unauthorized();
  }

  res.send(userService.normalize(user));
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = await jwtService.validateRefreshToken(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  const validationError = validateName(name);

  if (validationError) {
    throw ApiError.BadRequest('Validation error', { name: validationError });
  }

  if (!userData || !token || userData.id !== token.userId) {
    throw ApiError.Unauthorized();
  }

  const newUser = await userService.update({ name }, userData.id);

  res.status(200).send(userService.normalize(newUser));
};

const updateEmail = async (req, res) => {
  const { refreshToken } = req.cookies;
  const { password, email, emailConfirm } = req.body;

  const errors = {
    email: validateEmail(email),
    confirm: validateEmail(emailConfirm),
    password: validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  if (email !== emailConfirm) {
    throw ApiError.BadRequest('Invalid input', {
      confirmation: `Emails do not match`,
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

  const user = await userService.findById(userData.id);

  if (!user) {
    throw ApiError.NotFound();
  }

  const oldEmail = user.email;
  const isPasswordValid = await comparePasswords(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Password not correct');
  }

  const updatedUser = await userService.update({ email }, user.id);

  await emailService.notifyOldEmail(user.name, email, oldEmail);

  res.status(200).send(userService.normalize(updatedUser));
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;
  const { refreshToken } = req.cookies;

  const validationError = validatePassword(newPassword);

  if (validationError) {
    throw ApiError.BadRequest(validationError);
  }

  if (newPassword !== confirmation) {
    throw ApiError.BadRequest('Invalid input', {
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

  const user = await userService.findById(userData.id);

  const isPasswordValid = await comparePasswords(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Original password not correct');
  }

  await userService.update({ password: newPassword }, tokenFromDB.userId);

  res.sendStatus(200);
};

module.exports = {
  getProfile,
  getAllActive,
  updateName,
  updateEmail,
  updatePassword,
};
