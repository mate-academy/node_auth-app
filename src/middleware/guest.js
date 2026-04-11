'use strict';

const { verifyToken } = require('../services/token');

function guest(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  const decoded = verifyToken(token);

  if (decoded) {
    return res.redirect('/profile');
  }

  res.clearCookie('token');
  next();
}

module.exports = { guest };
