import { jwtService } from '../service/jwt.js';

export const authMiddleware = (req, res, next) => {
  const { authorization = '' } = req.headers;

  const [, token] = authorization.split(' ');

  if (!token) {
    return res.status(401).send();
  }

  const isJwtValid = jwtService.verifyAccess(token);

  if (!isJwtValid) {
    return res.status(401).send();
  }

  next();
};
