import { jwtService } from "../services/jwt.service.js";

export const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.sendStatus(401);
  }

  const [, token] = authorization.split(' ');

  if (!token) {
    return res.sendStatus(401);
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    return res.sendStatus(401);
  }

  req.user = userData; // 👈 ДУЖЕ ВАЖЛИВО
  next();
};
