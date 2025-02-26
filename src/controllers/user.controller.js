import { userService } from '../services/user.service.js';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(
    users.map(
      userService.normalize, // 'normalize' transfers only id and email
    ),
  );
};

export const userController = {
  getAllActivated,
};
