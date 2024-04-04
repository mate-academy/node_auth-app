import { ApiError } from "../exeptions/ApiError.js";
import cookie from 'cookie';
import { jwtService } from "../services/jwt.service.js";

export const catchError = (action) => {
  return async function(req, res, next) {
    try {
      await action(req, res, next) 
    } catch (e) {
      next(e);
    }
  }
};

export const catchAuthorizationError = (action) => {
  return async function(req, res, next) {
    try {
      await action(req, res, next) 
    } catch {
      try {
        const { refreshToken } = req.cookies;
        const verifiedUser = jwtService.verifyRefresh(refreshToken);

        res.setHeader(
          'Set-Cookie',
          cookie.serialize('refreshToken', '', {
            httpOnly: true,
            maxAge: 0,
          })
        );

        if (verifiedUser) {
          await tokenService.remove(verifiedUser.id);
        }
      } catch {
      } finally {
        next(ApiError.Unauthorized('Failed to refresh'));
      }   
    }
  }
};
  