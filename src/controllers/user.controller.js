'use strict';

const userService = require('../services/user.service');
const bcrypt = require('bcrypt');
const mailer = require('../utils/mailer');
const { randomUUID } = require('crypto');

async function getProfile(req, res) {
  const user = await userService.findById(req.user.id);

  if (!user) {
    res.sendStatus(404);

    return;
  }

  res.json({ user: userService.normalize(user) });
}

async function updateName(req, res) {
  const { name } = req.body || {};

  if (!name) {
    res.status(400).json({
      errors: { name: 'Name is required' },
      message: 'Validation error',
    });

    return;
  }

  const user = await userService.findById(req.user.id);

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.name = name;
  await user.save();

  res.json({ user: userService.normalize(user) });
}

async function updatePassword(req, res) {
  const { oldPassword, newPassword, confirmation } = req.body;
  const validatePassword = userService.validatePassword(newPassword);

  if (newPassword !== confirmation) {
    res.status(400).json({ message: 'Invalid password' });

    return;
  }

  if (validatePassword) {
    res.status(400).json({ message: 'Invalid password' });

    return;
  }

  const user = await userService.findById(req.user.id);

  if (!user) {
    res.sendStatus(404);

    return;
  }

  const isPasswordValid = await bcrypt.compare(
    oldPassword || '',
    user.password,
  );

  if (!isPasswordValid) {
    res.status(400).json({ message: 'InvalidPassword' });

    return;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password changed' });
}

async function requestEmailChange(req, res) {
  const { password, newEmail } = req.body || {};

  const emailError = userService.validateEmail(newEmail);

  if (emailError) {
    res.status(400).json({ message: 'Email is incorrect' });

    return;
  }

  const user = await userService.findById(req.user.id);

  if (!user) {
    res.sendStatus(404);

    return;
  }

  const isPasswordValid = await bcrypt.compare(password || '', user.password);

  if (!isPasswordValid) {
    res.status(400).json({ message: 'Invalid password' });

    return;
  }

  if (newEmail === user.email) {
    res
      .status(400)
      .json({ message: 'New email must differ from the current one' });

    return;
  }

  if (await userService.findByEmail(newEmail)) {
    res.status(400).json({ message: 'Email is already taken' });

    return;
  }

  const token = randomUUID();

  user.pendingEmail = newEmail;
  user.emailChangeToken = token;

  await user.save();
  await mailer.sendEmailChangeLink(newEmail, token);
  res.json({ message: 'Check your new email to confirm the change' });
}

async function confirmEmailChange(req, res) {
  const { email, token } = req.params;

  const user = await userService.findByEmailChangeToken(token);

  if (!user || user.pendingEmail !== email) {
    res.sendStatus(404);

    return;
  }

  if (await userService.findByEmail(user.pendingEmail)) {
    res.status(400).json({ message: 'This email is already taken' });

    return;
  }

  const oldEmail = user.email;

  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.emailChangeToken = null;

  await user.save();

  await mailer.sendEmailChangedNotice(oldEmail, user.email);
  res.json({ user: userService.normalize(user) });
}

module.exports = {
  userController: {
    getProfile,
    updateName,
    updatePassword,
    requestEmailChange,
    confirmEmailChange,
  },
};
