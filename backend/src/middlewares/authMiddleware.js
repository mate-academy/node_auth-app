import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  if (!authorization) {
    res.status(401).send('Authorization header is required');
    return;
  }

  const [, token] = authorization.split(' ');
  if (!token) {
    res.status(401).send('Token is required');
    return;
  }

  const decoded = jwtService.verify(token);

  if (!decoded) {
    res.status(401).send('Invalid token');
    return;
  }

  next();
};
