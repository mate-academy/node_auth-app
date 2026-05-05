import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const notAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header) {
    next();

    return;
  }

  const token = header.split(' ')[1];

  try {
    jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
    res.status(403).send({ error: 'Вже авторизовані' });
  } catch (error) {
    next();
  }
};
