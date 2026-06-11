import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt.service.js';
import { PublicUser } from '../services/user.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    res.sendStatus(401);
    return;
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    res.sendStatus(401);
    return;
  }

  req.user = userData as PublicUser;
  next();
};
