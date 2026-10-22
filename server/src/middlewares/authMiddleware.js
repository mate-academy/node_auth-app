const { jwtService } = require('../services/jwt.service.js');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.sendStatus(401);

    return;
  }

  const token = authHeader.split(' ')[1] || '';

  if (!token) {
    res.sendStatus(401);

    return;
  }

  try {
    const decoded = jwtService.verifyToken(token);

    if (!decoded) {
      res.sendStatus(403);

      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.sendStatus(403);
  }
};

module.exports = { authMiddleware };
