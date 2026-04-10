import { jwtService } from '../services/jwt.service.js';

export const guestMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [, token] = authorization.split(' ');

  if (token) {
    const userData = jwtService.verify(token);

    if (userData) {
      return res.status(403).send({
        message: 'Already authenticated',
      });
    }
  }

  next();
};
