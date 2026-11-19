import { user } from '../models/user.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const newUser = await user.create({ name, email, password });

  res.send(newUser);
};

export const authController = {
  register,
};
