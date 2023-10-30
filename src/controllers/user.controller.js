'use strict';

const userService = require('../services/user.service');
const emailService = require('../services/email.service');
const bcrypt = require('bcrypt');

const getUser = async(req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  res.send(user);
};

const updateName = async(req, res) => {
  const { id } = req.params;
  const { validatedName } = req;

  const user = await userService.getUserById(id);

  if (validatedName === user.name) {
    res.status(400).send({ error: 'Name is the same as the current name' });

    return;
  }

  await userService.updateName(id, validatedName);

  res.send({ message: 'Name updated' });
};

const updatePassword = async(req, res) => {
  const { id } = req.params;
  const { validatedNewPassword } = req;
  const { password } = req.body;

  const user = await userService.getUserById(id);

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    res.status(400).send({ error: 'Incorrect old password' });

    return;
  }

  await userService.updatePassword(user.id, validatedNewPassword);

  res.send({ message: 'Password updated' });
};

const updateEmail = async(req, res) => {
  const { id } = req.params;
  const { validatedNewEmail } = req;
  const { password } = req.body;

  const user = await userService.getUserById(id);

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    res.status(400).json({ error: 'Password is invalid' });

    return;
  }

  await userService.updateEmail(user.id, validatedNewEmail);

  await emailService.sendChangedEmail({ email: validatedNewEmail });

  res.send({ message: 'Email updated' });
};

module.exports = {
  getUser,
  updateName,
  updatePassword,
  updateEmail,
};
