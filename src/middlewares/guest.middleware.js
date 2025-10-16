import { jwtService } from '../services/jwt.service.js';

export const guestMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (token && jwtService.verify(token)) {
    return res.status(403).json({ message: 'You are already logged in' });
  }

  next();
};
