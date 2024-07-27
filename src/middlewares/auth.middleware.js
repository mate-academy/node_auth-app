const { validateAccessToken } = require('../utils/jwt.js');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!authHeader || !accessToken) {
    res.status(401).send({ message: 'Token is required' });

    return;
  }

  const userData = validateAccessToken(accessToken);

  if (!userData) {
    res.status(401).send({ message: 'Invalid token' });

    return;
  }

  next();
};

module.exports = {
  authMiddleware,
};
