import { JWTService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('Authorization header is required');
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer') {
    return res.status(400).send('Invalid token type');
  }

  if (!token) {
    return res.status(400).send('Token is required');
  }

  const userData = JWTService.verify(token);

  if (!userData) {
    return res.status(401).send('Invalid token');
  }

  req.userId = userData.id;

  next();
};
