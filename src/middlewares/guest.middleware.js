'use strict';

const { jwtService } = require('../services/jwt.service');
const { tokenService, TOKEN_TYPES } = require('../services/token.service');
const { getRefreshToken } = require('../utils/refreshCookie');
const { ApiError } = require('../utils/ApiError');

async function guestMiddleware(req, res, next) {
  try {
    const [type, token] = (req.headers.authorization || '').split(' ');

    if (type === 'Bearer' && token) {
      try {
        jwtService.verify(token);

        throw ApiError.forbidden('You are already authenticated');
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
      }
    }

    const refreshToken = await tokenService.findValid(
      getRefreshToken(req),
      TOKEN_TYPES.REFRESH,
    );

    if (refreshToken) {
      throw ApiError.forbidden('You are already authenticated');
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  guestMiddleware,
};
