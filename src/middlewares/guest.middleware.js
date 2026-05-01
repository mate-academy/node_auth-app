import { jwt } from '../utils/jwt.js';

export const guestMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');

  if (!token) {
    return next();
  }

  const userData = jwt.validateAccessToken(token);

  if (userData) {
    return res.status(403).json({
      message: 'Already authenticated',
    });
  }

  next();
};
