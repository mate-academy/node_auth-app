import { userService } from '../services/user.service.js';
import { User } from '../models/user.js';

export const userController = {
  async getAllActivated(req, res) {
    const users = await User.findAll({
      where: { activationToken: null },
    });

    res.send(users);
  },

  async updateProfile(req, res) {
    const userId = req.user.id;
    const { name } = req.body;

    const updatedUser = await userService.updateProfile(userId, { name });

    res.send(updatedUser);
  },
};
