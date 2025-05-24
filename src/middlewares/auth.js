const AppError = require('../utils/appError');
const { verify } = require('../auth/token.service');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token missing or malformed', 401));
  }

  const token = authHeader.split(' ')[1];

  let decoded;

  try {
    decoded = verify(token);
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }

  if (!decoded) {
    return next(new AppError('Invalid or expired token', 401));
  }

  req.id = decoded.id;

  next();
};

module.exports = { authMiddleware };
