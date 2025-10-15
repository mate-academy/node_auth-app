import { jwtService } from '../services/jwt.service.js';

export const guestMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (token && jwtService.verify(token)) {
    // User is authenticated - block guest-only page access
    return res.status(403).json({ message: 'You are already logged in' });
  }

  // Proceed for non-authenticated users
  next();
};
