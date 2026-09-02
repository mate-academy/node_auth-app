import { verifyAccessToken } from '../lib/tokens.js';
import { ApiError } from '../utils/ApiError.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const token = authHeader.slice('Bearer '.length);
  const payload = verifyAccessToken(token);

  if (!payload) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired access token');
  }

  req.userId = payload.sub;
  next();
}
