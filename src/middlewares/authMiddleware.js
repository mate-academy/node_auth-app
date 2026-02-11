import { jwtService } from '../services/jwtService.js';

export const authMiddleware = async (req, res, next) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!authorization || !token) {
    return res
      .status(401)
      .json({ message: 'Unauthorized: no token in authmiddleware' });
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    return res.status(401).json({ message: 'Unauthorized: no userData' });
  }
  next();
};
