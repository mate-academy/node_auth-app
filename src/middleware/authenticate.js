'use strict';

const { verifyToken } = require('../services/token');

function authenticate(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.clearCookie('token');

    return res.redirect('/auth/login');
  }

  req.userId = decoded.userId;
  next();
}

module.exports = { authenticate };
