'use strict';

const { sendActivationMail } = require('../services/mail.service.js');
const { tokenService } = require('../services/token.service.js');
const { userService } = require('../services/user.service.js');

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

exports.authController = {
  register,
};
