/* eslint-disable no-console */
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import { usersService } from '../services/users.service.js';
import { ApiError } from '../exceptions/api.error.js';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw ApiError.Unauthorized();
  }

  const [, token] = authorization.split(' ');

  if (!token) {
    throw ApiError.Unauthorized();
  }

  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);

    const user = usersService.getByEmail(email);

    if (!user) {
      throw ApiError.Unauthorized();
    }

    next();
  } catch (error) {
    console.log('error', error);

    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send(ReasonPhrases.UNAUTHORIZED);
  }
};
