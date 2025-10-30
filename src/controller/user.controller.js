import { userService } from '../services/user.service.js';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  if (!users) {
    return res.status(404).send({ message: 'No activated users found' });
  }

  res.send(users.map(userService.normalize));
};

export const userController = { getAllActivated };
