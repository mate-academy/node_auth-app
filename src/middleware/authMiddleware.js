const { verifyToken } = require('../utils/token');

const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.user = decoded;
  next();
};

const isNotAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);

    if (decoded) {
      return res.status(403).json({ message: 'Already authenticated' });
    }
  }

  // Token is either missing, invalid, or expired. Proceed as unauthenticated.
  next();
};

module.exports = { isAuthenticated, isNotAuthenticated };
