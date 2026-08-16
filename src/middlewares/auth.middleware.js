import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');

  if (!authHeader || !token) {
    return res.status(401).send({ message: 'Token missing' });
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    return res.status(401).send({ message: 'Invalid token' });
  }

  req.user = userData.user;
  next();
};
