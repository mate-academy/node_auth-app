/* eslint-disable no-console */
import { jwtService } from '../services/jwt.service.js';
import { userService } from '../services/user.service.js';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token or invalid format' });
    }

    const token = authHeader.split(' ')[1];
    const userData = jwtService.verify(token);

    if (!userData) {
      return res.status(401).json({ message: 'Token invalid or expired' });
    }

    console.log('authMiddleware: token payload', {
      id: userData.id,
      email: userData.email,
      jti: userData.jti,
      role: userData.role,
    });

    const user = await userService.findById(userData.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = { id: user.id, email: user.email };

    return next();
  } catch (err) {
    return next(err);
  }
}
