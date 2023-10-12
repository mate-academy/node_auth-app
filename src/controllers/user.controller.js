'use strict';

const { User } = require('../models/user');
const userService = require('../services/user.service');
const emailService = require('../services/email.service');

const getUser = async(req, res) => {
  const { id } = req.params;
  const normalizedUser = userService.getUser(id);

  res.send(normalizedUser);
};

const update = async(req, res) => {
  const { id } = req.params;
  const {
    name,
    newEmail,
    password,
    newPassword,
    confirmation,
  } = req.body;

  if (name) {
    await userService.updateName(id, name);

    res.sendStatus(200);
  }

  if (newEmail && password) {
    await userService.updateEmail(id, newEmail, password);

    res.sendStatus(200);
  }

  if (password && newPassword && confirmation) {
    await userService.updatePassword(id, password, newPassword, confirmation);

    res.sendStatus(200);
  }
};

const activate = async(req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  await emailService.sendEmailChangeNotification(user.email, user.newEmail);

  user.email = user.newEmail;
  user.newEmail = null;
  user.activationToken = null;
  user.save();

  res.sendStatus(200);
};

module.exports = {
  getUser,
  update,
  activate,
};
