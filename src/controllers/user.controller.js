'use strict';

const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendMail = require('../utils/sendMail');

function validatePassword(password) {
  const minLength = 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    typeof password === 'string' &&
    password.length >= minLength &&
    hasUpper &&
    hasDigit &&
    hasSpecial
  );
}

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateName = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Invalid name' });
    }

    user.name = name.trim();
    await user.save();

    res.json({ message: 'Name updated successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid old password' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          // eslint-disable-next-line max-len
          'Password must be at least 6 characters and include uppercase, number, and special character',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateEmail = async (req, res) => {
  try {
    const { password, newEmail, confirmEmail } = req.body;

    if (newEmail !== confirmEmail) {
      return res.status(400).json({ message: 'Emails do not match' });
    }

    const existingEmail = await User.findOne({ where: { email: newEmail } });

    if (existingEmail) {
      return res.status(400).json({ message: 'This email already exists' });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    await sendMail(
      user.email,
      'Email Change Notification',
      `Your email was changed to ${newEmail}.`,
    );

    user.email = newEmail;
    await user.save();

    res.json({ message: 'Email updated successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateName,
  updatePassword,
  updateEmail,
};
