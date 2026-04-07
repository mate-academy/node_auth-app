const User = require('../models/user');
const bcrypt = require('bcrypt');
const userService = require('../services/user.service');
const emailService = require('../services/email.service');
const ApiError = require('../exeptions/api.error');

const updateProfile = async (req, res) => {
  const {
    name,
    email,
    password,
    emailConfirmation,
    confirmation,
    oldPassword,
  } = req.body;
  const user = await User.findByPk(req.user.id);

  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordCorrect) {
    throw ApiError.badRequest('Incorrect old password');
  }

  if (email && email !== user.email) {
    const oldEmail = user.email;

    if (email !== emailConfirmation) {
      throw ApiError.badRequest('Email confirmation does not match');
    }

    user.email = email;

    await emailService.send(
      oldEmail,
      'Security Alert',
      'Your email has been changed.',
    );
  }

  if (password) {
    if (password !== confirmation) {
      throw ApiError.badRequest('Passwords do not match');
    }
    user.password = await bcrypt.hash(password, 10);
  }

  user.name = name || user.name;
  await user.save();

  res.send(userService.normalize(user));
};

module.exports = { updateProfile };
