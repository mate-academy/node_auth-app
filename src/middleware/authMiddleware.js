import { User } from '../models/userModel.js';
import { jwts } from '../services/jwtServices.js';

export const authMiddleware = async (request, response, next) => {
  const token = request.cookies.refreshToken;

  if (!token) {
    response.sendStatus(401);

    return;
  }

  const userData = jwts.verify(token);

  if (!userData) {
    response.sendStatus(401);

    return;
  }

  const id = userData.id;
  const user = await User.findOne({ where: { id } });

  if (!user) {
    response.sendStatus(401);

    return;
  }

  request.user = user;
  next();
};
