import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header) {
    res.status(401).send('He авторизовано');

    return;
  }

  const token = header.split(' ')[1];

  try {
    const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);

    (req as any).user = userData;
    next();
  } catch (error) {
    res.status(401).send('He авторизовано');
  }
};
