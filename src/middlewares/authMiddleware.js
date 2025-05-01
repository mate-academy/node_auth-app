import { jwtService } from "../service/jwt.service";

export const authMiddleware = (req, res, next) => {
  const authorization = req.header['authorization'] || '';
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

  next();
}