import ApiError from '../exeptions/api.error.js';
import * as jwtService from '../services/jwt.service.js';

const checkAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    throw ApiError.unauthorized();
  }

  const token = req.headers.authorization.split(' ')[1];

  try {
    const verified = jwtService.verifyToken(token);

    if (!verified) {
      throw ApiError.unauthorized();
    }

    res.locals.user = verified;

    next();
  } catch (error) {
    throw ApiError.unauthorized();
  }
};

export default checkAuth;
