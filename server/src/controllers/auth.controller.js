import { User } from '../models/user.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const newUser = await User.create({ name, email, password });

  res.send(newUser);
};

export const authControllers = {
  register,
};
