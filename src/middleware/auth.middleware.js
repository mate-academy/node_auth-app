import { jwtService } from '../services/jwt.service.js';

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    res.sendStatus(401);

    return;
  }

  let userData;

  try {
    userData = jwtService.validateAccessToken(token);
  } catch (err) {
    res.send(err);
  }

  if (!userData) {
    res.sendStatus(401);

    return;
  }

  next();
};
