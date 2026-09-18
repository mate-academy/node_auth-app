/* eslint-disable max-len */
'use strict';

const { User } = require('../model/user.model');
const userService = require('../service/user.service');
const emailService = require('../service/email.service');
const bcrypt = require('bcrypt');

const salt = 10;

const getProfile = (req, res) => {
  const user = req.user;

  res.status(200).json(userService.normalize(user));
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const { id } = req.user;

  const updateUser = await userService.updateUser(id, { name });

  res.status(200).json(userService.normalize(updateUser));
};

const updateEmail = async (req, res) => {
  const { email, confirmEmail, password } = req.body;
  const { id } = req.user;

  const user = await User.findByPk(id);

  if (!user.password) {
    res.status(400).json({
      message:
        'Cannot change email for OAuth-only account without a password set. Add password ',
    });

    return;
  }

  if (!(await bcrypt.compare(password, user.password))) {
    res.status(400).json({ message: 'Password is incorrect' });

    return;
  }

  if (email !== confirmEmail) {
    res.status(401).json({ message: 'New password is not the same' });

    return;
  }

  const oldEmail = user.email;
  const updateUser = await userService.updateUser(id, { email });

  if (oldEmail) {
    await emailService.send(
      oldEmail,
      'Email changed',
      `Your email was changed to ${email}`,
    );
  }

  res.status(200).json(userService.normalize(updateUser));
};

const updatePassword = async (req, res) => {
  const { confirmPassword, oldPassword, newPassword } = req.body;
  const { id } = req.user;
  const user = await User.findByPk(id);

  if (!user.password) {
    res
      .status(400)
      .json({ message: 'No password set. Use set-password instead.' });

    return;
  }

  if (newPassword !== confirmPassword) {
    res.status(400).json({ message: 'New password is not the same' });

    return;
  }

  if (!(await bcrypt.compare(oldPassword, user.password))) {
    res.status(401).json({ message: 'Password is incorrect' });

    return;
  }

  const hashPassword = await bcrypt.hash(newPassword, salt);

  const updateUser = await userService.updateUser(id, {
    password: hashPassword,
  });

  res.status(200).json(userService.normalize(updateUser));
};

const setPassword = async (req, res) => {
  const { confirmPassword, newPassword } = req.body;
  const { id } = req.user;

  const user = await User.findByPk(id);

  if (user.password) {
    res
      .status(400)
      .json({ message: 'Password already set, use update instead' });

    return;
  }

  if (newPassword !== confirmPassword) {
    res.status(400).json({ message: 'New password is not the same' });

    return;
  }

  const hashPassword = await bcrypt.hash(newPassword, salt);

  const updateUser = await userService.updateUser(id, {
    password: hashPassword,
  });

  res.status(200).json(userService.normalize(updateUser));
};

module.exports = {
  getProfile,
  updateName,
  updateEmail,
  updatePassword,
  setPassword,
};
