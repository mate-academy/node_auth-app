import { userRepository } from "./user.repository.js";

const getAll = async (req, res) => {
  const users = await userRepository.getAll();

  return res.json(users);
};

export const userController = {
  getAll,
};

