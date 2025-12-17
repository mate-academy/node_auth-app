// src/middlewares/authMiddleWare.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const tokenBlacklist = new Set();

export const authenticate = async (req, res, next) => {
  const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token revoked. Please login again.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['passwordHash', 'activationToken', 'resetToken', 'resetTokenExpiresAt'] }
    });

    if (!user) return res.status(401).json({ message: 'User not found.' });
    if (!user.active) return res.status(403).json({ message: 'Account not activated.' });

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Authentication error.' });
  }
};

export const addToBlacklist = (token) => {
  if (!token) return;
  tokenBlacklist.add(token);
  setTimeout(() => tokenBlacklist.delete(token), 24 * 60 * 60 * 1000);
  console.log(`Token blacklisted: ${token.substring(0, 20)}...`);
};

export const isTokenBlacklisted = (token) => tokenBlacklist.has(token);
export const clearBlacklist = () => {
  const count = tokenBlacklist.size;
  tokenBlacklist.clear();
  return count;
};