import { jwtService } from "../services/jwt.sevrices.js";

export const authMiddlewares = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.sendStatus(401);
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    return res.sendStatus(401);
  }

  req.user = userData;
  next();
};
