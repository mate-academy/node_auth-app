import { User } from '../models/user.js';

const auth = (req, res) => {
  res.send('hello');
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const newUser = await User.create({ name, email, password });

  res.send(newUser);
};

export const authController = {
  auth,
  register,
};
