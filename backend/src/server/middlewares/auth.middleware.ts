import type { NextFunction, Request, Response } from 'express';
import { jwtService } from '../../services/jwt.service.ts';
import { userService } from '../../services/user.service.ts';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers['authorization'] || '';
  const [, accesToken] = authHeader.split(' ');

  if (!authHeader || !accesToken) {
    return res.status(401).json({ message: 'Token is required' });
  }

  const accessPayload = jwtService.accessToken.verify(accesToken);

  if (!accessPayload) {
    return res.status(401).json({ message: 'Token is invalid' });
  }

  const user = await userService.getByEmail(accessPayload.email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (!user.isActivated) {
    return res.status(401).json({ message: 'Account is not activated' });
  }

  const normalizedUser = userService.normalize(user);

  if (
    Object.entries(normalizedUser).some(
      ([key, value]) => accessPayload[key] !== value,
    )
  ) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.locals.normalizedUser = userService.normalize(user);

  next();
}
