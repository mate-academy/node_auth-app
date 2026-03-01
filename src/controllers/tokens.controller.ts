import 'dotenv/config';

import type { NextFunction, Request, Response } from "express";
import { ApiError, type NormalizedUser } from "../types/index.ts";
import * as jws from '../service/jws.service.ts';
import * as UsersRepository from '../repository/users.repository.ts';

const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies['refreshToken'] || '';
  let normalizedUser = jws.validateRefreshToken(refreshToken);

  if (!normalizedUser) {
    throw ApiError.authError([{
      message: 'Unauthorized'
    }]);
  }

  const accessToken = jws.generateAccessToken(
    UsersRepository.normalize(normalizedUser)
  );

  res.statusCode = 201;
  res.send({ accessToken });
};

const checkAccess = async (req: Request, res: Response) => {
  const accessToken = req.headers['authorization']?.split(' ')[1] || '';

  const data = jws.validateAccessToken(accessToken);

  if (!data) {
    throw ApiError.authError([{
      message: 'Invalid access key'
    }]);
  }

  res.sendStatus(204);
}

export {
  refreshAccessToken,
  checkAccess,
}
