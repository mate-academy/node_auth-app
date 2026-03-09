import jwt from 'jsonwebtoken';

export function guestMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, 'secret');

    return res.status(403).json({
      message: 'You are already authenticated',
    });
  } catch {
    next();
  }
}
