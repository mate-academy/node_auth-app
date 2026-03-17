const jwt = require('jsonwebtoken');

require('dotenv').config();

function authMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send('unauthorized');
  }

  try {
    const userData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = userData;
    next();
  } catch {
    return res.status(401).send('Invalid token');
  }
}

function guestMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (token) {
    return res.redirect('/profile');
  }

  next();
}

module.exports = { authMiddleware, guestMiddleware };
