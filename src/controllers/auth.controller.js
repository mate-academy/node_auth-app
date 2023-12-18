'use strict';

const { sendActivationMail } = require('../services/mail.service.js');
const { tokenService } = require('../services/token.service.js');
const { userService } = require('../services/user.service.js');
const { ApiError } = require('../utils/api.error.js');

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  const activationToken = tokenService.generateActivationToken();

  await userService.create({
    name,
    email,
    password,
    activationToken,
  });

  await sendActivationMail(email, activationToken);

  res
    .status(201)
    .send({ message: 'User created check email to activate account' });
};

const sendAuth = ({ id, email, name }, res) => {
  const userDataToShow = {
    id,
    email,
    name,
  };

  const accessToken = tokenService.createAccessToken(userDataToShow);

  res.send({
    accessToken,
    user: userDataToShow,
  });
};

const activate = async (req, res, next) => {
  const { activationToken } = req.params;
  const user = await userService.findByToken(activationToken);

  if (user === null) {
    throw ApiError.NotFound();
  }

  const activatedUser = await userService.activateUser(user);

  sendAuth(activatedUser, res);
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userService.findActiveUser(email);

  await userService.checkPassword(password, user);

  sendAuth(user, res);
};

exports.authController = {
  register,
  activate,
  login,
};
