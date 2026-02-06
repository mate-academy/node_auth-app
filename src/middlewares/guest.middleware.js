import { jwtService } from '../services/jwt.services.js';

export const guestMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    return next();
  }

  const [, token] = auth.split(' ');
  const user = jwtService.verify(token);

  if (user) {
    return res.redirect('/profile');
  }

  next();
};
