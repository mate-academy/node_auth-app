const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendEmailChangedNotification } = require('../services/emailService');

const hasCapitalLetter = (string) => /[A-Z]/.test(string);

router.get('/profile', authMiddleware, async (req, res) => {
  return res.status(200).json(req.user);
});

router.patch('/name', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Lack of name in request' });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name;

    await user.save();

    return res
      .status(200)
      .json({ message: 'Name has been changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/password', authMiddleware, async (req, res) => {
  try {
    const saltRounds = 10;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password too short' });
    } else if (!hasCapitalLetter(newPassword)) {
      return res
        .status(400)
        .json({ message: 'Password must contain at least one capital letter' });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isOldPasswordTheSame = await bcrypt.compare(
      oldPassword,
      user.password,
    );

    if (!isOldPasswordTheSame) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    if (newPassword === oldPassword) {
      return res
        .status(400)
        .json({ message: 'Current and new password cant be the same' });
    }

    const hash = await bcrypt.hash(newPassword, saltRounds);

    user.password = hash;

    await user.save();

    return res
      .status(200)
      .json({ message: 'Password has been changed succesfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/email', authMiddleware, async (req, res) => {
  try {
    const { password, newEmail, confirmNewEmail } = req.body;

    if (!password || !newEmail || !confirmNewEmail) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newEmail !== confirmNewEmail) {
      return res.status(400).json({ message: 'New mail do not match' });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordTheSame = await bcrypt.compare(password, user.password);

    if (!isPasswordTheSame) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    await sendEmailChangedNotification(user.email);

    user.email = newEmail;

    await user.save();

    res.status(200).json({ message: 'Email has been changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
