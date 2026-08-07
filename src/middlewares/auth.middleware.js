'use strict';

const { User } = require('../models');
const { jwtService } = require('../services/jwt.service');
const { ApiError } = require('../utils/ApiError');

async function authMiddleware(req, res, next) {
  try {
    const authorization = (req.headers.authorization || '').trim();

    if (!authorization) {
      throw ApiError.unauthorized('Authorization token is required');
    }

    const [type, token] = authorization.split(/\s+/);

    if (type !== 'Bearer' || !token) {
      throw ApiError.unauthorized('Invalid authorization format');
    }

    let payload;

    try {
      payload = jwtService.verify(token);
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const user = await User.findByPk(payload.userId);

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authMiddleware,
};
