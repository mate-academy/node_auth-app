'use strict';

const { User } = require('../models/user');
const userService = require('../services/userService');
const jwtService = require('../services/jwtService');

const register = async(req, res, next) => {
  const { email, password } = req.body;

  await userService.register(email, password);

  res.send({ message: 'OK' });
};

const activate = async(req, res, next) => {
  const { activationToken } = req.params;
  const user = await User.findOne({
    where: { activationToken },
  });

  if (!user) {
    res.sendStatus(404);
  }

  user.activationToken = null;
  await user.save();

  res.send(user);
};

const login = async(req, res, next) => {
  const { email, password } = req.body;
  const user = await userService.getByEmail(email);

  if (password !== user.password) {
    res.sendStatus(401);

    return;
  };

  const userData = userService.normalize(user);
  const accessToken = jwtService.generateAccessToken(userData);

  res.send({
    user: userData,
    accessToken,
  });
};

module.exports = {
  register,
  activate,
  login,
};
