import bcrypt from 'bcrypt';
import { getAllActiveUsers } from '../services/users-service.js';

export const usersController = {
  async getAll(req, res) {
    const activeUsers = await getAllActiveUsers();

    res.send(activeUsers);
  },
};

export const compareUserPasswords = (user, plainPassword) => {
  return bcrypt.compare(plainPassword, user.password);
};
