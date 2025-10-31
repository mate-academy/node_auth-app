import { User } from '../models/user.js';
import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = async (req, res, next) => {
  const token =
    req.cookies?.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).send({ message: 'No token provided' });
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    return res.status(401).send({ message: 'Invalid or expired token' });
  }

  const user = await User.findByPk(userData.id);

  if (!user) {
    return res.status(401).send({ message: 'User not found' });
  }

  req.user = user;

  next();
};

export const guestOnly = (req, res, next) => {
  const token =
    req.cookies?.token || req.headers['authorization']?.split(' ')[1];

  if (token) {
    const userData = jwtService.verify(token);

    if (userData) {
      return res.redirect('/profile'); // або просто статус 403
    }
  }

  next();
};
