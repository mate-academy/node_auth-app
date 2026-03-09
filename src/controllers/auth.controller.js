'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

const { users } = require('../models/user.model');
const { sendActivationEmail } = require('../services/email.service');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send('Missing fields');
  }

  const hash = await bcrypt.hash(password, 10);

  const activationToken = uuid();

  const user = {
    id: uuid(),
    name,
    email,
    password: hash,
    isActive: false,
    activationToken,
  };

  users.push(user);

  await sendActivationEmail(email, activationToken);

  res.status(201).send(user);
};

const activate = (req, res) => {
  const { token } = req.params;

  const user = users.find((u) => u.activationToken === token);

  if (!user) {
    return res.status(404).send('Invalid token');
  }

  user.isActive = true;
  delete user.activationToken;

  res.send('Account activated');
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).send('Invalid credentials');
  }

  if (!user.isActive) {
    return res.status(403).send('Activate email first');
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).send('Invalid credentials');
  }

  const token = jwt.sign({ id: user.id }, 'secret', {
    expiresIn: '1d',
  });

  res.send({ token });
};

const profile = (req, res) => {
  const user = users.find((u) => u.id === req.user.id);

  res.send(user);
};

module.exports = {
  register,
  activate,
  login,
  profile,
};
