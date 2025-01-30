import { jwtService } from '../services/jwt.service.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const [, accessToken] = authHeader.split(' ');

  if (!authHeader || !accessToken) {
    res.status(401).json({ message: 'Token is required' });

    return;
  }

  const userData = jwtService.validateAccessToken(accessToken);

  if (!userData) {
    res.status(401).json({ message: 'Invalid token' });

    return;
  }

  next();
}
