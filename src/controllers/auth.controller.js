import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { emailService } from '../services/email.service.js';
import { authService } from '../services/auth.service.js';

const register = async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await authService.hashPassword(password);

  const newUser = await User.create({ email, password: hashedPassword });

  const activationToken = 'some_generated_token';
  await emailService.sendActivationEmail(email, activationToken);

  res.status(201).json({ message: 'Registration successful! Please check your email to activate your account.' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user || !(await authService.comparePasswords(password, user.password))) {
    return res.status(400).json({ message: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(400).json({ message: 'Please activate your email.' });
  }

  req.session.userId = user.id;
  res.status(200).json({ message: 'Login successful!' });
};

const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ message: 'Email not found.' });
  }

  const resetToken = 'some_generated_token';

  user.resetToken = resetToken;
  await user.save();

  await emailService.sendPasswordResetEmail(email, resetToken);

  res.status(200).json({ message: 'Password reset instructions sent to your email.' });
};

const resetPasswordConfirm = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  const user = await User.findOne({ where: { resetToken: token } });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }

  const hashedPassword = await authService.hashPassword(newPassword);

  user.password = hashedPassword;
  user.resetToken = null;
  await user.save();

  res.status(200).json({ message: 'Password reset successful!' });
};

export const authController = {
  register,
  login,
  resetPasswordRequest,
  resetPasswordConfirm,
};
