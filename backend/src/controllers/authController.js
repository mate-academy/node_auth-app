/* eslint-disable no-console */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

// REGISTER
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hash,
    activationToken: uuidv4(),
    isActive: false,
  });

  console.log(`Activate: /auth/activate/${user.email}/${user.activationToken}`);

  res.json({ message: 'Check email' });
};

// ACTIVATE
export const activate = async (req, res) => {
  const { email, token } = req.params;

  const user = await User.findOne({
    where: { email, activationToken: token },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid link' });
  }

  user.isActive = true;
  await user.save();

  res.json({ message: 'Activated' });
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
