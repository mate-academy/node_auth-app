import { ApiError } from '../exeptions/api.error.js';

export const requireOwnershipMiddleware = (req, res, next) => {
  const paramValue = Number(req.params.id);

  if (paramValue !== req.user.id) {
    throw ApiError.forbidden();
  }

  next();
};
