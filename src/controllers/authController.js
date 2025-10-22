const User = require('../models/User');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const mailController = require('./mailController');
const usersRepository = require('../services/usersRepository');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const cryptoModule = require('crypto');

require('dotenv').config();

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const errors = {
      email: usersRepository.validateEmail(email),
      password: usersRepository.validatePassword(password),
    };

    if (Object.values(errors).some((error) => error)) {
      return res.status(400).json({
        errors,
        message: 'Validation error',
      });
    }

    const existingUser = await usersRepository.getByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(400).json({
        errors: { email: 'Email is already taken' },
        message: 'Validation error',
      });
    }

    const activationToken = uuidv4();

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password,
      activationToken,
    });

    const activationLink = `http://${process.env.API_URL}/auth/activate/${activationToken}`;

    await mailController.sendMail({
      to: email,
      subject: 'Активація акаунту',
      text: `Привіт, ${name}! Перейдіть за посиланням для активації акаунту: ${activationLink}`,
    });

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const activateAccount = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { activationToken: token } });

    if (!user) {
      return res.status(400).send('Invalid activation link');
    }

    user.activationToken = null;
    user.isActive = true;
    await user.save({ fields: ['activationToken', 'isActive'] });

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    res
      .cookie('token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
      .redirect('/profile');

    // res.send('Акаунт активовано!');
    return res.redirect('/profile');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await usersRepository.getByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials (no user)' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account not activated' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: 'Invalid credentials (wrong password)' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
      .redirect('/profile');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');

  // return res.status(200).json({ message: 'Logged out successfully' });

  return res.redirect('/login');
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(200).json({ message: 'If user exists, email was sent' });
  }

  const resetToken = cryptoModule.randomBytes(32).toString('hex');

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save({ fields: ['resetPasswordToken', 'resetPasswordExpires'] });

  const resetLink = `http://${process.env.API_URL}/auth/reset-password/${resetToken}`;

  await mailController.sendMail({
    to: email,
    subject: 'Password Reset',
    text: `Click this link to reset your password: ${resetLink}`,
  });

  res.status(200).json({ message: 'Email sent if user exists' });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmation } = req.body;

  if (password !== confirmation) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const user = await User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save({
    fields: ['password', 'resetPasswordToken', 'resetPasswordExpires'],
  });

  res
    .status(200)
    .json({ message: 'Password reset successful. You can now login.' });
};

module.exports = {
  createUser,
  activateAccount,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
