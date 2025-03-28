const { validateAccessToken } = require('../utils/jwt.js');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Invalid or missing authorization token' });
  }

  const accessToken = authHeader.split(' ')[1];

  if (!accessToken) {
    return res.status(401).json({ message: 'Token is required' });
  }

  const userData = validateAccessToken(accessToken);

  if (!userData) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.user = userData;

  next();
};

module.exports = {
  authMiddleware,
};
