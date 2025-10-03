/* eslint-disable no-console */
const express = require('express');
const { register } = require('./auth.controller');
const { login } = require('./login.controller');
const { activate } = require('./activate.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { refreshTokenController } = require('./refresh.controller');
const { forgotPassword } = require('./forgot-password.controller');
const { resetPassword } = require('./reset-password.controller');
const { db } = require('../utils/db');

const router = express.Router();

// Registration
router.post('/register', register);

// Activation
router.get('/activate/:id', activate);

// Login
router.post('/login', login);

// Profile (protected)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        isActive: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ profile: user });
  } catch (error) {
    console.error('Profile error:', error);

    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update profile name
router.put('/profile/name', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res
        .status(400)
        .json({ message: 'Name must be at least 2 characters long' });
    }

    const updatedUser = await db.user.update({
      where: { id: req.user.id },
      data: { name },
    });

    return res.status(200).json({
      message: 'Profile updated',
      profile: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);

    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await db.token.deleteMany({
      where: { userId: req.user.id },
    });

    return res.redirect(process.env.CLIENT_URL + '/login');
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh', refreshTokenController);

// Forgot & reset password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:id', resetPassword);

module.exports = router;
