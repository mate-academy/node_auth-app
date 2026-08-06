import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';

export const guestMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const accessToken = authHeader.split(' ')[1];

  const tokenVerified = await jwtService.verify(accessToken);

  if (tokenVerified) {
    return next(ApiError.forbidden('Already authenticated'));
  }

  next();
};
