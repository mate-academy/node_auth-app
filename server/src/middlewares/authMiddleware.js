import { ApiError } from "../exceptions/api.error.js";
import { jwtService } from "../services/jwt.service.js";

export const authMiddleware = async (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [_, token] = authorization.split(' ');
  let userData = null;

  if (!authorization || !token) {
    res.sendStatus(401);

    return;
  }

  try {
    userData = jwtService.verify(token);
  } catch (error) {
    throw ApiError.unauthorized();
  }

  if (!userData) {
    res.sendStatus(401);

    return;
  }

  req.user = userData;

  next();
};
