const uuid = require('uuid');

const { ApiError } = require('../exceptions/api.error');

const usersService = require('../services/users.service');
const emailService = require('../services/email.service');
const hashService = require('../services/hash.service');

const changeName = async (req, res) => {
  const { newName } = req.body;

  if (!newName) {
    throw ApiError.badRequest('New name is required');
  }

  const user = await usersService.getById(res.userData.id);

  user.name = newName;
  await user.save();

  res.sendStatus(200);
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw ApiError.badRequest(
      'Old password, new password and confirmation password are required',
    );
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('Passwords does not match');
  }

  const user = await usersService.getById(res.userData.id);

  const isPasswordValid = await hashService.verifyPassword(
    oldPassword,
    user.hashedPassword,
  );

  if (!isPasswordValid) {
    throw ApiError.badRequest('Old password is invalid');
  }

  await usersService.changePassword(user.id, newPassword);

  res.sendStatus(200);
};

const changeEmail = async (req, res) => {
  const { newEmail } = req.body;

  const user = await usersService.getById(res.userData.id);

  if (!newEmail) {
    throw ApiError.badRequest('New email is required');
  }

  const activationToken = uuid.v4();

  user.newEmail = newEmail;
  user.emailChangeToken = activationToken;

  await user.save();

  await emailService.sendNewEmailActivation(activationToken, newEmail);

  res.send(usersService.normalize(user));
};

const activateEmail = async (req, res) => {
  const { token } = req.params;

  const user = await usersService.getById(res.userData.id);

  if (!token) {
    throw ApiError.badRequest('Invalid token', { token: 'Invalid token' });
  }

  const oldEmail = user.email;
  const result = await usersService.activateNewEmail(token);

  if (!result) {
    throw ApiError.badRequest('Invalid token', { token: 'Invalid token' });
  }

  await emailService.notifyOldEmail(oldEmail);

  res.sendStatus(200);
};

module.exports = {
  changeName,
  changePassword,
  changeEmail,
  activateEmail,
};
