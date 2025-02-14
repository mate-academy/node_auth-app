import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).send({ message: 'Token is required' });
  }

  const [, accessToken] = authHeader.split(' ');

  if (!accessToken) {
    return res.status(401).send({ message: 'Token is required' });
  }

  const userData = jwtService.validateAccessToken(accessToken);

  if (!userData) {
    return res.status(401).send({ message: 'Invalid token' });
  }

  next();
};
