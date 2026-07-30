import { user } from '../models/user.js';

const register = async (req, res) => {
  const { email, password } = req.body;

  const newUser = await user.create({ email, password });

  res.send(newUser);
};

export const authController = {
  register,
};
