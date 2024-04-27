'use strict';

const userServices = require('../services/userServices.js');
const { User } = require('../models/user.js');
const emailServices = require('../services/emailServices.js');

const getUser = async(req, res) => {
  const { id } = req.params;
  const normalizedUser = userServices.getUser(id);

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
    await userServices.updateName(id, name);

    res.sendStatus(200);
  }

  if (newEmail && password) {
    await userServices.updateEmail(id, newEmail, password);

    res.sendStatus(200);
  }

  if (password && newPassword && confirmation) {
    await userServices.updatePassword(id, password, newPassword, confirmation);

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

  await emailServices.sendEmailChangeNotification(user.email, user.newEmail);

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
