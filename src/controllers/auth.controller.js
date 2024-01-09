'use strict';

const { User } = require('../models/user.js');
const emailService = require('../services/email.service.js');
const { v4: uuidv4 } = require('uuid');

const register = async(req, res) => {
  const { name, email, password } = req.body;
  const activationToken = uuidv4();

  const newUser = await User.create({
    name,
    email,
    password,
    activationToken,
  });

  emailService.sendActivationEmail(email, activationToken);
  res.send(newUser);
};

const activate = async(req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    res.sendStatus(404);

    // eslint-disable-next-line no-useless-return
    return;
  }

  user.activationToken = null;
  user.save();

  res.send(user);
};

const login = async(req, res) => {
  // const { email, password } = req.body;

};

module.exports = {
  register,
  activate,
  login,
};
