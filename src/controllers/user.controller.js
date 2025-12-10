/* eslint-disable */
import { userService } from '../services/user.service.js';

const getAllActivated = async (req, res) => {
  const users = (await userService.getAllActivated()).map((u) =>
    userService.normalize(u),
  );

  res.status(200).json(users);
};

export const userController = {
  getAllActivated,
};
