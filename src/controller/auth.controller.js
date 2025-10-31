import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import bcrypt from 'bcrypt';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) =>
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ message: 'Email and password are required' });
    }

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return res.status(400).send({
        message: 'Invalid email or password format',
        errors: {
          email: !isEmailValid,
          password: !isPasswordValid,
        },
      });
    }

    const existingUser = await userService.findByEmail(email);

    if (existingUser) {
      return res.status(409).send({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = uuidv4();

    await User.create({ email, password: hashedPassword, activationToken });
    await emailService.sendActivationEmail(email, activationToken);

    res.status(201).send({
      message: 'User registered successfully. Check your email.',
    });
  } catch (err) {
    res.status(500).send({ message: 'Server error', error: err.message });
  }
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.status(404).send({ message: 'Invalid activation token' });
  }

  user.isActivated = true;
  user.activationToken = null;
  await user.save();

  res.redirect('/login');

  res.status(200).send({ message: 'Account activated successfully' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) {
    return res.status(401).send({ message: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).send({ message: 'Invalid email or password' });
  }

  if (user.activationToken) {
    return res.status(403).send({ message: 'Account not activated yet' });
  }

  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);

  res.status(200).send({ user: normalizedUser, accessToken });
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
  res.send({ message: 'Logged out successfully' });
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res
      .status(200)
      .send({ message: 'If email exists, reset link sent' });
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;
  await user.save();

  const resetLink = `${process.env.CLIENT_HOST}/reset-password/${resetToken}`;

  const html = `
    <h1>Password Reset</h1>
    <p>Please click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
  `;

  await emailService.sendEmail(email, 'Password Reset', html);

  res.send({ message: 'Reset email sent' });
};

const verifyResetToken = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { resetToken: token } });

  if (!user) {
    return res.status(400).send({ message: 'Invalid or expired token' });
  }
  res.send({ message: 'Valid token' });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send({ message: 'Passwords do not match' });
  }

  const user = await User.findOne({ where: { resetToken: token } });

  if (!user) {
    return res.status(400).send({ message: 'Invalid token' });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  await user.save();

  res.send({ message: 'Password successfully reset' });
};

export const authController = {
  register,
  activate,
  login,
  logout,
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
};
