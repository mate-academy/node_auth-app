import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '../models/user.model.js';
import nodemailer from 'nodemailer';

const generateToken = () => crypto.randomBytes(32).toString('hex');

const register = async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = generateToken();

  const newUser = await User.create({
    email,
    password: hashedPassword,
    activationToken,
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const activationUrl = `${process.env.CLIENT_HOST}/activate/${activationToken}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: newUser.email,
    subject: 'Activate Your Account',
    text: `Please click the following link to activate your account: ${activationUrl}`,
  });

  res.status(201).json({ message: 'User registered. Check your email for activation.' });
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ message: 'Email not found.' });
  }

  const resetToken = generateToken();
  user.resetToken = resetToken;
  await user.save();

  const resetUrl = `${process.env.CLIENT_HOST}/reset-password/${resetToken}`;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Password Reset',
    text: `Please click the following link to reset your password: ${resetUrl}`,
  });

  res.status(200).json({ message: 'Password reset link sent.' });
};

const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;
  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = null;
  await user.save();

  res.status(200).json({ message: 'Password successfully reset. You can now log in.' });
};

export const authController = {
  register,
  requestPasswordReset,
  resetPassword,
};
