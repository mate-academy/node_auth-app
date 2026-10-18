const jwt = require('jsonwebtoken');

require('dotenv').config();

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'authorization not provided' });
  }

  const authParts = authHeader.split(' ');

  if (authParts.length !== 2 || authParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'error format token ' });
  }

  const token = authParts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    return next();
  } catch (error) {
    return res.status(403).json({ message: 'token inválido ou expired' });
  }
}

module.exports = { authMiddleware };
