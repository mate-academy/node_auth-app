import jwt from 'jsonwebtoken';
import prisma from '../prisma/prismaClient.js';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: 'Authorization header is missing' });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid authorization format' });
    }

    const payload = jwt.verify(token, 'secret');

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
