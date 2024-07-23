import bcrypt from 'bcrypt';
import { getAllActiveUsers } from '../services/users-service.js';
import { verifyAccessToken } from '../services/jwt-service.js';
import { ApiError } from '../exceptions/API-error.js';
import { parseAccessToken } from '../utils/parseAccessToken.js';

export const usersController = {
  async getAll(req, res) {
    const activeUsers = await getAllActiveUsers();

    res.send(activeUsers);
  },

  async getProfile(req, res) {
    const auth = req.headers.authorization;

    const accessToken = parseAccessToken(auth);

    const tokenData = verifyAccessToken(accessToken);

    if (!tokenData) {
      throw ApiError.Unauthorized();
    }

    res.send({
      id: tokenData.id,
      name: tokenData.name,
      email: tokenData.email,
    });
  },
};

export const compareUserPasswords = (user, plainPassword) => {
  return bcrypt.compare(plainPassword, user.password);
};
