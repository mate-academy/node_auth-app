import { validateAccessToken } from '../services/token.service.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Неавторизовано' });
  }

  const accessToken = authHeader.split(' ')[1];

  if (!accessToken) {
    return res.status(401).json({ message: 'Неавторизовано' });
  }

  const userData = validateAccessToken(accessToken);

  if (!userData) {
    return res.status(401).json({ message: 'Недійсний token' });
  }

  req.user = userData;
  next();
};
