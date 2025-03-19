import { jwtService } from "../services/jwt.service.js";

export const authMiddleware = async (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [_, token] = authorization.split(' ');

  if (!authorization || !token) {
    res.sendStatus(401);
    return;
  }

  const userData = jwtService.verify(token)

  if (!userData) {
    res.sendStatus(401);
    return;
  }

  next();
}
