'use strict';

const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const { User } = require('../models');

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = req.cookies.accessToken || header.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, env.jwt.accessSecret);
    const user = await User.findByPk(payload.userId);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
}

module.exports = { authMiddleware };
