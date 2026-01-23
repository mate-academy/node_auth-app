'use strict';

const express = require('express');
const bcrypt = require('bcrypt');

const { User } = require('../models/User');
const { RefreshSession } = require('../models/RefreshSession');

const { validatePassword } = require('../services/password');
const {
  sha256,
  createRandomToken,
  signAccessToken,
  signRefreshToken,
  verifyJwt,
  computeRefreshExpiryDate,
} = require('../services/tokens');

const {
  sendActivationEmail,
  sendResetPasswordEmail,
} = require('../services/mailer');

const { auth } = require('../middlewares/auth');

const authRouter = express.Router();

const REFRESH_COOKIE = process.env.COOKIE_REFRESH_NAME || 'refreshToken';

function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // в проде true (https)
    path: '/auth',
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
}

async function createRefreshSession(userId, refreshToken) {
  const refreshTokenHash = sha256(refreshToken);
  const expiresAt = computeRefreshExpiryDate();

  return RefreshSession.create({
    userId,
    refreshTokenHash,
    expiresAt,
  });
}

authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      // eslint-disable-next-line max-len
      return res
        .status(400)
        .json({ message: 'name, email, password required' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be 8+ chars and contain letters + numbers',
      });
    }

    const exists = await User.findOne({ where: { email } });

    if (exists) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const activationToken = createRandomToken();
    const activationTokenHash = sha256(activationToken);

    await User.create({
      userName: name,
      email,
      passwordHash,
      isActive: false,
      activationTokenHash,
    });

    await sendActivationEmail(email, activationToken);

    // eslint-disable-next-line max-len
    return res
      .status(201)
      .json({ message: 'Registered. Check your email to activate.' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);

    return res.status(500).json({ message: 'Server error' });
  }
});

authRouter.get('/activate/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const tokenHash = sha256(token);

    const user = await User.findOne({
      where: { activationTokenHash: tokenHash },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid activation token' });
    }

    user.isActive = true;
    user.activationTokenHash = null;
    await user.save();

    const payload = { id: user.id };
    // const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await createRefreshSession(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    return res.redirect(`${process.env.CLIENT_URL}/profile?activated=1`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);

    return res.status(500).json({ message: 'Server error' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password required' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Please activate your email' });
    }

    const payload = { id: user.id };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await createRefreshSession(user.id, refreshToken);
    setRefreshCookie(res, refreshToken);

    return res.json({
      accessToken,
      user: { id: user.id, userName: user.userName, email: user.email },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);

    return res.status(500).json({ message: 'Server error' });
  }
});

authRouter.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    // eslint-disable-next-line padding-line-between-statements
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    let payload;

    try {
      payload = verifyJwt(refreshToken);
    } catch {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const session = await RefreshSession.findOne({
      where: { refreshTokenHash: sha256(refreshToken) },
    });

    if (!session) {
      clearRefreshCookie(res);

      return res.status(401).json({ message: 'Session not found' });
    }

    const newRefreshToken = signRefreshToken({ id: payload.id });

    session.refreshTokenHash = sha256(newRefreshToken);
    session.expiresAt = computeRefreshExpiryDate();
    await session.save();

    setRefreshCookie(res, newRefreshToken);

    const accessToken = signAccessToken({ id: payload.id });

    return res.json({ accessToken });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);

    return res.status(500).json({ message: 'Server error' });
  }
});

// Logout: only authenticated (access token)
authRouter.post('/logout', auth, async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];

    if (refreshToken) {
      await RefreshSession.destroy({
        where: { refreshTokenHash: sha256(refreshToken) },
      });
    }

    clearRefreshCookie(res);

    return res.status(204).send();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);

    return res.status(500).json({ message: 'Server error' });
  }
});

authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: 'email required' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.json({ message: 'If account exists, email was sent' });
    }

    const resetToken = createRandomToken();

    user.resetTokenHash = sha256(resetToken);
    user.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    await sendResetPasswordEmail(email, resetToken);

    return res.json({ message: 'If account exists, email was sent' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);

    return res.status(500).json({ message: 'Server error' });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmation } = req.body || {};

    if (!token || !password || !confirmation) {
      return res
        .status(400)
        .json({ message: 'token, password, confirmation required' });
    }

    if (password !== confirmation) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be 8+ chars and contain letters + numbers',
      });
    }

    const user = await User.findOne({
      where: { resetTokenHash: sha256(token) },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    if (
      !user.resetTokenExpiresAt ||
      user.resetTokenExpiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: 'Reset token expired' });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;
    await user.save();

    await RefreshSession.destroy({ where: { userId: user.id } });

    return res.json({ message: 'Password updated' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);

    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = { authRouter };
