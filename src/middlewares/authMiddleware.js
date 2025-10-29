import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'];
  const [, token] = authorization ? authorization.split(' ') : [];

  if (!token || !authorization) {
    return res.status(401).send({ message: 'No token provided' });
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    return res.status(401).send({ message: 'Invalid token' });
  }

  next();
};
