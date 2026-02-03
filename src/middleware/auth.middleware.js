import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'NO_TOKEN' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'INVALID_TOKEN_FORMAT' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'TOKEN_MISSING' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (e) {
    return res.status(401).json({ message: 'INVALID_TOKEN' });
  }
}
