const uuid = require('uuid');

const { ApiError } = require('../exceptions/api.error');

const emailService = require('../services/email.service');
const usersService = require('../services/users.service');
const tokenService = require('../services/token.service');

const resetPassword = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    throw ApiError.badRequest('You need to specify the email', {
      email: 'You need to specify the email',
    });
  }

  const user = await usersService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User with this email does not exists', {
      email: 'User with this email does not exists',
    });
  }

  const token = uuid.v4();

  user.resetToken = token;
  await user.save();

  await emailService.sendResetPassword(token, email);

  res.sendStatus(201);
};

const changePassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmationPassword } = req.body;

  if (!token) {
    throw ApiError.badRequest('Token is required');
  }

  if (!password || !confirmationPassword) {
    throw ApiError.badRequest(
      'Password and confirmation password are required',
    );
  }

  if (password !== confirmationPassword) {
    throw ApiError.badRequest('Passwords does not match');
  }

  const user = await usersService.getByResetToken(token);

  if (!user) {
    throw ApiError.badRequest('User does not exists');
  }

  await usersService.changePassword(user.id, password);
  await tokenService.remove(user.id);

  res.sendStatus(200);
};

module.exports = {
  resetPassword,
  changePassword,
};
