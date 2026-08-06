import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';

export const guestMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const accessToken = authHeader.split(' ')[1];

  if (accessToken && jwtService.verify(accessToken)) {
    return next(ApiError.forbidden('Already authenticated'));
  }

  next();
};
