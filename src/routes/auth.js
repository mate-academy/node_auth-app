const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const {
  sendActivationEmail,
  sendPasswordResetEmail,
} = require('../services/emailService');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const hasCapitalLetter = (string) => /[A-Z]/.test(string);

router.post('/register', async (req, res) => {
  const saltRounds = 10;
  const activationToken = uuidv4();

  try {
    const { name, email, password } = req.body;

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password too short' });
    } else if (!hasCapitalLetter(password)) {
      return res
        .status(400)
        .json({ message: 'Password must contain at least one capital letter' });
    }

    const userExist = await User.findOne({ where: { email: email } });

    if (userExist) {
      return res.status(400).json({ message: 'This email is already in use' });
    }

    const hash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name: name,
      email: email,
      password: hash,
      activationToken: activationToken,
    });

    await sendActivationEmail(email, activationToken);

    res.status(201).json({
      message:
        // eslint-disable-next-line max-len
        'User registered successfully. Please check your email to activate your account.',
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (user === null) {
      return res.status(401).json({ message: 'Wrong email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Wrong email or password' });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message:
          // eslint-disable-next-line max-len
          'Your account has not been activated. Please check your mail for activation messsage',
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token: token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/activate/:token', async (req, res) => {
  const token = req.params.token;

  const user = await User.findOne({
    where: {
      activationToken: token,
    },
  });

  if (user === null) {
    return res
      .status(400)
      .json({ message: 'Invalid or expired activation link' });
  }

  user.isActive = true;
  user.activationToken = null;

  await user.save();

  res.status(200).json({ message: 'Account has been activated' });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'User needs to provide email' });
    }

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      const resetToken = uuidv4();

      user.resetToken = resetToken;

      await user.save();

      await sendPasswordResetEmail(email, resetToken);
    }

    return res.status(200).json({
      message:
        // eslint-disable-next-line max-len
        'If an account with that email exists, we sent a password reset link.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/reset-password/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const { newPassword, confirmPassword } = req.body;
    const saltRounds = 10;

    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: 'Both password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password too short' });
    } else if (!hasCapitalLetter(newPassword)) {
      return res
        .status(400)
        .json({ message: 'Password must contain at least one capital letter' });
    }

    const user = await User.findOne({
      where: {
        resetToken: token,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hash = await bcrypt.hash(newPassword, saltRounds);

    user.password = hash;
    user.resetToken = null;

    await user.save();

    return res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', authMiddleware, (req, res) => {
  return res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
