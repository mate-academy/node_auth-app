'use strict';

const { randomBytes } = require('crypto');
const bcrypt = require('bcrypt');
const { usersRepository } = require('../entity/users.repository.js');
const { tokensRepository } = require('../entity/tokens.repository.js');
const { userService } = require('../services/user.service.js');
const { mailer } = require('../utils/mailer.js');

const SALT_ROUNDS = 10;

const updateName = async (req, res) => {
  const { name } = req.body;
  const { id } = req.user;

  const nameError = userService.validateName(name);

  if (nameError) {
    res.status(400).json({ message: nameError });

    return;
  }

  const user = await usersRepository.updateName(id, name);

  res.json({ user: userService.normalize(user) });
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, newPasswordConfirmation } = req.body;
  const { email } = req.user;

  if (newPassword !== newPasswordConfirmation) {
    res.status(400).json({ message: 'Passwords do not match' });

    return;
  }

  const passwordError = userService.validatePassword(newPassword);

  if (passwordError) {
    res.status(400).json({ message: passwordError });

    return;
  }

  const user = await usersRepository.getByEmail(email);
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    res.status(401).json({ message: 'Wrong password' });

    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await usersRepository.updatePassword(email, hashedPassword);

  res.sendStatus(204);
};

const updateEmail = async (req, res) => {
  const { password, newEmail, newEmailConfirmation } = req.body;
  const { email: oldEmail, id } = req.user;

  if (newEmail !== newEmailConfirmation) {
    res.status(400).json({ message: 'Emails do not match' });

    return;
  }

  const emailError = userService.validateEmail(newEmail);

  if (emailError) {
    res.status(400).json({ message: emailError });

    return;
  }

  const user = await usersRepository.getByEmail(oldEmail);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({ message: 'Wrong password' });

    return;
  }

  const existingUser = await usersRepository.getByEmail(newEmail);

  if (existingUser) {
    res.status(400).json({ message: 'Email is already taken' });

    return;
  }

  const activationToken = randomBytes(32).toString('hex');

  await Promise.all([
    usersRepository.updateEmail(id, newEmail, activationToken),
    tokensRepository.deleteByUserId(id),
    mailer.sendNewEmailConfirmation(newEmail, activationToken),
    mailer.sendEmailChangeNotification(oldEmail),
  ]);

  res.sendStatus(204);
};

const profileController = { updateName, updatePassword, updateEmail };

module.exports = { profileController };
