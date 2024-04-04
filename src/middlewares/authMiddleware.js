import { jwtService } from "../services/jwt.service.js";
import { ApiError } from "../exeptions/ApiError.js";

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    throw ApiError.Unauthorized();
  }

  const userData = jwtService.verifyAccess(token);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  next();
};
