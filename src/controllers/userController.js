'use strict';

const userServices = require('../services/userServices.js');
const { User } = require('../models/user.js');
const emailServices = require('../services/emailServices.js');
const { ApiError } = require('../exeption/apiError.js');

const getUser = async(req, res) => {
  const { id } = req.params;

  try {
    const normalizedUser = userServices.getUser(id);

    res.send(normalizedUser);
  } catch (error) {
    throw ApiError.serverError(error);
  }
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

  try {
    if (name) {
      await userServices.updateName(id, name);

      res.sendStatus(200);
    }

    if (newEmail && password) {
      await userServices.updateEmail(id, newEmail, password);

      res.sendStatus(200);
    }

    if (password && newPassword && confirmation) {
      await userServices.updatePassword(
        id,
        password,
        newPassword,
        confirmation
      );

      res.sendStatus(200);
    }
  } catch (error) {
    throw ApiError.serverError(error);
  }
};

const activate = async(req, res) => {
  const { activationToken } = req.params;

  try {
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
  } catch (error) {
    throw ApiError.serverError(error);
  }
};

module.exports = {
  getUser,
  update,
  activate,
};
