const { usersService, emailService } = require('../services');
const { User, SocialAccount } = require('../models');
const { ApiError } = require('../exceptions');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const getAll = async (req, res) => {
  const users = await usersService.getAllActive();

  res.send(users.map(usersService.normalize));
};

const updateName = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw ApiError.badRequest('Name is required');
  }

  const user = await User.findByPk(req.user.id);

  user.name = name;
  await user.save();

  res.send(usersService.normalize(user));
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  if (!oldPassword) {
    throw ApiError.badRequest('Old password is required');
  }

  if (!newPassword) {
    throw ApiError.badRequest('New password is required');
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Passwords do not match');
  }

  if (newPassword.length < 6) {
    throw ApiError.badRequest('Bad Request', {
      password: 'Password must be at least 6 characters long',
    });
  }

  const user = await User.findByPk(req.user.id);

  if (!user.password) {
    throw ApiError.badRequest(
      'No local password set. Please use a social provider to sign in.',
    );
  }

  const isValid = await bcrypt.compare(oldPassword, user.password);

  if (!isValid) {
    throw ApiError.badRequest('Wrong old password');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.send({ message: 'Password updated successfully' });
};

const updateEmail = async (req, res) => {
  const { password, newEmail, newEmailConfirmation } = req.body;
  const user = await User.findByPk(req.user.id);

  if (!user.password) {
    throw ApiError.badRequest(
      'No local password set. Please use a social provider to sign in.',
    );
  }

  if (!password) {
    throw ApiError.badRequest('Password is required');
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!newEmail || !emailPattern.test(newEmail)) {
    throw ApiError.badRequest('Bad Request', { email: 'Email is not valid' });
  }

  if (newEmail !== newEmailConfirmation) {
    throw ApiError.badRequest('Email addresses do not match');
  }

  const existing = await usersService.getByEmail(newEmail);

  if (existing) {
    throw ApiError.badRequest('Email is already taken');
  }

  const emailChangeToken = uuidv4();

  user.pendingEmail = newEmail;
  user.emailChangeToken = emailChangeToken;
  await user.save();

  await emailService.sendEmailChangeConfirmation(newEmail, emailChangeToken);

  res.send({
    message: 'Confirmation email sent. Please check your new inbox.',
  });
};

const confirmEmail = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { emailChangeToken: token } });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired confirmation link');
  }

  const oldEmail = user.email;

  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.emailChangeToken = null;
  await user.save();

  await emailService.sendEmailChangeNotification(oldEmail);

  res.send({
    message: 'Email updated successfully',
    user: usersService.normalize(user),
  });
};

const getSocialAccounts = async (req, res) => {
  const accounts = await SocialAccount.findAll({
    where: { userId: req.user.id },
    attributes: ['provider', 'providerId'],
  });

  res.json(accounts);
};

const removeSocialAccount = async (req, res) => {
  const { provider } = req.params;
  const removed = await SocialAccount.destroy({
    where: { userId: req.user.id, provider },
  });

  if (!removed) {
    return res.status(404).send({ message: 'Social account not found' });
  }

  res.sendStatus(204);
};

const getMe = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw ApiError.notFound();
  }

  res.send(usersService.normalize(user));
};

module.exports = {
  getAll,
  getMe,
  updateName,
  updatePassword,
  updateEmail,
  confirmEmail,
  getSocialAccounts,
  removeSocialAccount,
};
