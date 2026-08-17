import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import ApiError from '../utils/ApiError.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization?.trim();

  if (!authHeader) {
    throw new ApiError(401, 'Authorization header is missing');
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    throw new ApiError(401, 'Invalid authorization format');
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findByPk(decoded.userId);

  if (!user || user.tokenVersion !== decoded.tokenVersion) {
    throw new ApiError(401, 'Session expired. Please login again');
  }

  req.user = decoded;

  next();
};
