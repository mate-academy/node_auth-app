'use strict';

const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const userService = require('../services/user.service');
const mailer = require('../utils/mailer');

async function register(req, res) {
  const { name, email, password } = req.body;

  const errors = {
    email: userService.validateEmail(email),
    password: userService.validatePassword(password),
  };

  if (errors.email || errors.password) {
    res.status(400).json({ errors, message: 'Validation error' });

    return;
  }

  const existingUser = await userService.findByEmail(email);

  if (existingUser) {
    res.status(400).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });

    return;
  }

  const activationToken = randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userService.create(
    name,
    email,
    hashedPassword,
    activationToken,
  );

  await mailer.sendActivationLink(email, activationToken);

  res.json({ user: userService.normalize(user) });
}

module.exports = {
  authController: {
    register,
  },
};
