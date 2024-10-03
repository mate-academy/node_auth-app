import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  console.log('headers authorization ', authorization);
  const [, token] = authorization.split(' ');

  console.log('token ', token);
  if (!authorization || !token) {
    res.status(401).json({ message: 'Token is required' });

    return;
  }

  const userData = jwtService.verify(token);
  if (!userData) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  next();
};
