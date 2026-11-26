import { User } from '../models/user.model.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '../services/user.service.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const getRegister = (req, res) => {
  const filePath = path.join(dirname, '../public', 'register.html');
  const html = fs.readFileSync(filePath, 'utf-8');

  res.send(html);
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const activationToken = uuidv4();

  if (password.length < 6) {
    return res.send('Password must be at least 6 characters');
  }

  await User.create({
    name,
    email,
    password,
    activationToken,
  });
  await emailService.sendActivationEmail(email, activationToken);
  res.redirect('/activation');
};

const getActivation = (req, res) => {
  const filePath = path.join(dirname, '../public', 'activation.html');
  const html = fs.readFileSync(filePath, 'utf-8');

  res.send(html);
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.isActive = true;
  user.activationToken = null;
  await user.save();

  req.session.userId = user.id;

  res.redirect('/profile');
};

const getLogin = (req, res) => {
  const filePath = path.join(dirname, '../public', 'login.html');
  const html = fs.readFileSync(filePath, 'utf-8');

  res.send(html);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user || user.password !== password || !user.isActive) {
    return res.status(401).send('Invalid credentials or not activated');
  }

  if (!user.isActive) {
    return res.send('Please activate your account. Check your email.');
  }

  req.session.userId = user.id;
  res.redirect('/profile');
};

const getProfile = async (req, res) => {
  const user = await User.findByPk(req.session.userId);

  if (!user) {
    return res.redirect('/login');
  }

  const filePath = path.join(dirname, '../public', 'profile.html');
  let html = fs.readFileSync(filePath, 'utf-8');

  html = html
    .replaceAll('{{name}}', user.name)
    .replaceAll('{{email}}', user.email);

  res.send(html);
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

const updateName = async (req, res) => {
  const { name } = req.body;

  const user = await User.findByPk(req.session.userId);

  user.name = name;
  await user.save();

  res.redirect('/profile');
};

const updateEmail = async (req, res) => {
  const { email, emailConfirmation, password } = req.body;

  if (email !== emailConfirmation) {
    return res.send('Emails do not match');
  }

  if (password.length < 6) {
    return res.send('Password must be at least 6 characters');
  }

  const user = await User.findByPk(req.session.userId);

  if (password !== user.password) {
    return res.send('Incorrect password');
  }

  const oldEmail = user.email;

  user.email = email;
  await user.save();

  await emailService.send(
    oldEmail,
    'Email Changed',
    `Your email was changed to ${email}`,
  );

  res.redirect('/profile');
};

const getChangePassword = async (req, res) => {
  const user = await User.findByPk(req.session.userId);

  if (!user) {
    return res.redirect('/login');
  }

  const filePath = path.join(dirname, '../public', 'changePassword.html');
  const html = fs.readFileSync(filePath, 'utf-8');

  res.send(html);
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  if (newPassword.length < 6 || confirmation.length < 6) {
    return res.send('Password must be at least 6 characters');
  }

  const user = await User.findByPk(req.session.userId);

  if (oldPassword !== user.password) {
    return res.send('Old password is incorrect');
  }

  if (newPassword !== confirmation) {
    return res.send('Passwords do not match');
  }

  user.password = newPassword;
  await user.save();

  res.redirect('/profile');
};

const getReset = (req, res) => {
  const filePath = path.join(dirname, '../public', 'reset.html');
  const html = fs.readFileSync(filePath, 'utf-8');

  res.send(html);
};

const reset = async (req, res) => {
  const { email } = req.body;

  const user = await userService.findByEmail(email);

  if (user) {
    const token = uuidv4();

    user.resetToken = token;
    user.resetTokenExpiriesAt = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();

    await emailService.sendResetEmail(email, token);
  }

  res.redirect('/resetSent');
};

const resetSent = (req, res) => {
  const filePath = path.join(dirname, '../public', 'resetSent.html');
  const html = fs.readFileSync(filePath, 'utf-8');

  res.send(html);
};

const getNewPassword = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { resetToken: token } });

  if (!user) {
    return res.sendStatus(404);
  }

  const filePath = path.join(dirname, '../public', 'newPassword.html');
  let html = fs.readFileSync(filePath, 'utf-8');

  html = html.replace('{{token}}', token);

  res.send(html);
};

const setNewPassword = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { resetToken: token } });
  const { password, confirmation } = req.body;

  if (!user) {
    return res.sendStatus(404);
  }

  if (password.length < 6 || confirmation.length < 6) {
    return res.send('Password must be at least 6 characters');
  }

  if (password !== confirmation) {
    return res.send(400);
  }

  user.password = password;
  user.resetToken = null;
  user.resetTokenExpiriesAt = null;
  await user.save();

  res.redirect('/resetSuccess');
};

const getResetSuccess = (req, res) => {
  const filePath = path.join(dirname, '../public', 'resetSuccess.html');
  const html = fs.readFileSync(filePath, 'utf-8');

  res.send(html);
};

export const authController = {
  register,
  getRegister,
  getActivation,
  activate,
  login,
  getLogin,
  getProfile,
  logout,
  updateName,
  updateEmail,
  getChangePassword,
  changePassword,
  getReset,
  reset,
  resetSent,
  getNewPassword,
  setNewPassword,
  getResetSuccess,
};
