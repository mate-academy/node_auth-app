import { jwtService } from '../services/jwtService.js';

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: 'No token' });
  }

  const token = header.split(' ')[1];

  const user = jwtService.verify(token);

  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.user = user;

  next();
};
