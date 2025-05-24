import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).send('Access token cookie is required');

    return;
  }

  const decoded = jwtService.verify(token);

  if (!decoded) {
    res.status(401).send('Invalid token');

    return;
  }

  next();
};
