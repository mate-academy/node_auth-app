import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (request, response, next) => {
  const authorization = request.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    response.sendStatus(401);

    return;
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    response.sendStatus(401);

    return;
  }

  request.user = userData;

  next();
};
