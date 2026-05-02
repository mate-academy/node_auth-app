/* eslint-disable curly */
/* eslint-disable no-console */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { sendActivationEmail } from '../services/emailService.js';

const validatePassword = (password) => {
  if (!password) {
    throw new Error('Password is required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain a number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw new Error('Password must contain a special character');
  }
};

// REGISTER
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    validatePassword(password);

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hash,
      activationToken: uuidv4(),
      isActive: false,
    });

    await sendActivationEmail(user);

    res.json({ message: 'Check email' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// ACTIVATE
export const activate = async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    where: { activationToken: token },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid link' });
  }

  user.isActive = true;
  user.activationToken = null;

  await user.save();

  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  res.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Activate email first' });
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' },
  );

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};

// REFRESH
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const data = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign({ id: data.id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    res.json({ accessToken });
  } catch (e) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  res.clearCookie('refreshToken');

  res.json({ message: 'Logged out' });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  user.resetToken = uuidv4();
  await user.save();

  console.log(`Reset: /reset-password/${user.resetToken}`);

  res.json({ message: 'Email sent' });
};

export const resetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const user = await User.findOne({ where: { resetToken: token } });

  if (!user) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;

  await user.save();

  res.json({ message: 'Password changed' });
};
