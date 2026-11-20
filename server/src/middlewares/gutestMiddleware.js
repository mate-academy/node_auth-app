import { ApiError } from "../exceptions/api.error.js";
import { jwtService } from "../services/jwt.service.js";

export const guestMiddleware = async (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [_, token] = authorization.split(' ');

  if (!authorization || !token) {
    next()

    return;
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    next()

    return;
  }

  throw ApiError.badRequest('user is authorized')
};
