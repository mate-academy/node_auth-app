'use strict';

const { verifyJwt } = require('../services/tokens');

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = verifyJwt(token);

    req.user = payload;

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = { auth };
