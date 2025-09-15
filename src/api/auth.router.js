const express = require('express');
const { register } = require('./auth.controller');
const { login } = require('./login.controller');
const { activate } = require('./activate.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { refreshTokenController } = require('./refresh.controller');
const { forgotPassword } = require('./forgot-password.controller');
const { resetPassword } = require('./reset-password.controller');
const { changePassword } = require('./change-password.controller');
const { db } = require('../utils/db');

const router = express.Router();

// Registration
router.post('/register', register);

// Email activation
router.get('/activate/:id', activate);

// Login
router.post('/login', login);

// Protected Profile route
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ profile: user });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Profile error:', error);

    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().lenth < 2) {
      return res
        .status(400)
        .json({ message: 'Name must be at least 2 characters' });
    }

    const updatedUser = await db.user.update({
      where: { id: req.user.id },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });

    return res
      .status(200)
      .json({ message: 'Profile updated', profile: updatedUser });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Update profile error:', error);

    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await require('../utils/db').db.token.deleteMany({
      where: { userId: req.user.id },
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/refresh', refreshTokenController);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:id', resetPassword);

router.patch('/change-password', authMiddleware, changePassword);

module.exports = router;
