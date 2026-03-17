/* eslint-disable no-console */
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const {
  validateEmail,
  validatePassword,
  send,
} = require('../services/auth.services');

const profile = async (req, res) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId, {
    attributes: ['id', 'name', 'email'],
  });

  res.send(user);
};

const changeName = async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;

  const user = await User.findByPk(userId);

  user.name = name;
  await user.save();
  res.send('Username changed');
};

const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { password, newPassword, confirm } = req.body;

  if (newPassword !== confirm) {
    return res.send('Passwords do not match');
  }

  const user = await User.findByPk(userId);

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.status(401).send('Invalid credentials');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.send('password changed');
};

const resetPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(401).send('Invalid credentials');
  }

  const token = uuidv4();

  user.resetToken = token;

  await send(
    user.email,
    'password reset',
    `go to link http://localhost:3000/reset/${token}`,
  );

  await user.save();
  res.send('email sent');
};

const resetPasswordConfirm = async (req, res) => {
  const { resetToken } = req.params;
  const { password, repeatPassword } = req.body;

  const errorPassword = validatePassword(password);

  if (errorPassword) {
    return res.status(400).send(errorPassword);
  }

  if (password !== repeatPassword) {
    return res.send('passwords not equil');
  }

  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    return res.status(401).send('Invalid credentials');
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  await user.save();

  return res.send(`
  <h1>Password changed successfully</h1>
  <a href="/login">Go to login</a>
`);
};

const changeEmail = async (req, res) => {
  const userId = req.user.id;
  const { password, email, confirmEmail } = req.body;

  const user = await User.findByPk(userId);

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.status(401).send('Invalid credentials');
  }

  if (email !== confirmEmail) {
    return res.status(400).send('Emails do not match');
  }

  const errorEmail = validateEmail(email);

  if (errorEmail) {
    return res.status(400).send(errorEmail);
  }

  const uuid = uuidv4();

  await send(
    user.email,
    'Email change notification',
    'Your email is being changed.',
  );

  await send(
    email,
    'Activate new email',
    `Go to link http://localhost:3000/activation/${uuid}`,
  );

  user.email = email;
  user.isActivated = false;
  user.activationToken = uuid;

  await user.save();

  return res.redirect('/login');
};

const logout = async (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};

module.exports = {
  userController: {
    profile,
    changeName,
    changePassword,
    changeEmail,
    logout,
    resetPassword,
    resetPasswordConfirm,
  },
};
