import { userService } from '../services/user.service.js';

const getAllActivated = async (req, res) => {
  const users = await userService
    .getAllActivated()
    .then((users) => users.map(userService.normalize));

  res.send(users);
};

export const userController = {
  getAllActivated,
};
