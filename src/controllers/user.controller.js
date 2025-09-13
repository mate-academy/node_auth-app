import * as userModel from '../services/user.service.js';

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Не вдалося зчитати користувачів' });
  }
};

export const userController = {
  getAllUsers,
};
