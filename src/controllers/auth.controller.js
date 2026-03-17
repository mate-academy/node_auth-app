/* eslint-disable no-console */
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const {
  validateEmail,
  validatePassword,
  send,
} = require('../services/auth.services');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const registration = async (req, res) => {
  const { name, email, password } = req.body;
  const errorEmail = validateEmail(email);
  const errorPassword = validatePassword(password);

  if (errorEmail) {
    return res.status(400).send(errorEmail);
  }

  if (errorPassword) {
    return res.status(400).send(errorPassword);
  }

  const exist = await User.findOne({ where: { email } });

  if (exist !== null) {
    return res.status(401).send('User already exist');
  }

  const cashedPassword = await bcrypt.hash(password, 10);

  const uuid = uuidv4();

  await User.create({
    name: name,
    email: email,
    password: cashedPassword,
    activationToken: uuid,
  });

  await send(
    email,
    'Activate email',
    `go to link http://localhost:3000/activation/${uuid}`,
  );
  res.status(201).send('User created');
};

const activation = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.status(404).send('Invalid activation token');
  }

  user.isActivated = true;
  user.activationToken = null;
  await user.save();
  res.redirect('http://localhost:3000/profile');
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const existUser = await User.findOne({ where: { email } });

  if (!existUser) {
    return res.status(404).send('User not found');
  }

  const isValid = await bcrypt.compare(password, existUser.password);

  if (!isValid) {
    return res.status(401).send('Invalid credentials');
  }

  if (!existUser.isActivated) {
    await send(
      email,
      'Activate email',
      `go to link http://localhost:3000/activation/${existUser.activationToken}`,
    );

    return res.status(403).send('Activate email first');
  }

  const token = jwt.sign(
    { id: existUser.id, email: existUser.email },
    process.env.JWT_SECRET,
    { expiresIn: '30 days' },
  );

  res.cookie('token', token, { httpOnly: true });
  res.redirect('http://localhost:3000/profile');
};

module.exports = {
  authController: {
    registration,
    activation,
    login,
  },
};
