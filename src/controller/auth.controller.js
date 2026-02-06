import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { userServices } from '../services/user.services.js';
import { emailServices } from '../services/email.services.js';
import { jwtService } from '../services/jwt.services.js';
import { User } from '../models/User.model.js';

function validatePassword(pwd) {
  if (!pwd || pwd.length < 6) {
    return 'At least 6 characters';
  }
}

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (validatePassword(password)) {
    return res.status(400).json({ password: validatePassword(password) });
  }

  const exists = await userServices.findUser(email);

  if (exists) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const activationToken = uuidv4();
  const hash = bcrypt.hashSync(password, 10);

  await userServices.registerUser(name, email, hash, activationToken);
  await emailServices.sendActivationEmail(email, activationToken);

  res.status(201).json({ message: 'Check your email to activate account' });
};

const activateUser = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.activationToken = null;
  await user.save();

  res.redirect('/profile');
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const user = await userServices.findUser(email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.activationToken) {
    return res.status(403).json({ message: 'Activate your email' });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // token generato SOLO per sessione client, non restituito
  const normalized = userServices.normilizeUser(user);
  const token = jwtService.sign(normalized);

  // opzionale: se i test non lo richiedono, puoi anche ometterlo
  res.setHeader('Authorization', `Bearer ${token}`);

  return res.redirect('/profile');
};

const logout = (req, res) => {
  res.redirect('/login');
};

const forgot = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email required' });
  }

  const user = await userServices.findUser(email);

  if (!user) {
    return res.sendStatus(200);
  }

  user.resetToken = uuidv4();
  await user.save();

  await emailServices.sendResetPasswordEmail(email, user.resetToken);
  res.json({ message: 'Email sent' });
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmation } = req.body;

  if (!password || password !== confirmation) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  user.password = bcrypt.hashSync(password, 10);
  user.resetToken = null;
  await user.save();

  res.json({ message: 'Password changed' });
};

export const authController = {
  registerUser,
  activateUser,
  loginUser,
  logout,
  forgot,
  resetPassword,
};
