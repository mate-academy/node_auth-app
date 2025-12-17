import User from '../models/User.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { addToBlacklist } from '../middleware/authMiddleWare.js';
import { sendActivationEmail } from '../service/sendActivationMail.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      activationToken,
    });

    await sendActivationEmail(email, activationToken);

    return res.status(201).json({
      message: 'User registered. Check your email to activate the account.',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

export const activate = async (req, res) => {
  const token = req.body.token || req.params.token;

  if (!token) {
    return res.status(400).json({ message: 'Activation token is required.' });
  }

  try {
    const user = await User.findOne({ where: { activationToken: token } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid activation token.' });
    }

    user.active = true;
    user.activationToken = null;
    await user.save();

    return res.status(200).json({ message: 'Account activated successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Please activate your account first.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

export const logout = (req, res) => {
  const token = req.cookies?.token || 
                req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    addToBlacklist(token);
    console.log(`Logout: Token ${token.substring(0, 20)}... adicionado à blacklist`);
  }

  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
  });

  return res.status(200).json({ 
    message: 'Logged out successfully.',
    tokenRevoked: !!token 
  });
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json({ message: 'Email sent if user exists.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 3600 * 1000);

    await user.update({ resetToken, resetTokenExpiresAt });

    console.log(
      `Reset link: http://localhost:5173/reset-password/${resetToken}`,
    );

    return res.status(200).json({ message: 'Reset email sent.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

export const resetPasswordConfirm = async (req, res) => {
  const { token, password, passwordConfirm } = req.body;

  if (!token || !password || !passwordConfirm) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password !== passwordConfirm) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await user.update({
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    });

    return res.status(200).json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};