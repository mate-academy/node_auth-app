import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (!payload || typeof payload !== 'object' || !payload.id) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      id: payload.id,
      email: payload.email,
    };

    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
