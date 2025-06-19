import { jwt } from '../utils/jwt.js';
import ApiError from '../exceptions/ApiError.js';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return next(ApiError.Unauthorized('Authorization header is missing.'));
  }

  const [, accessToken] = authHeader.split(' ');

  if (!accessToken) {
    return next(ApiError.Unauthorized('Access token is missing.'));
  }

  const userData = jwt.validateAccessToken(accessToken);

  if (!userData) {
    return next(ApiError.Unauthorized('Invalid or expired access token.'));
  }

  req.user = userData;
  next();
}
