import { User } from '../models/user.js';

const register = async (req, res) => {
  const { email, password, name } = req.body;

  const newUser = await User.create({ email, password, name });

  res.send(newUser);
  // res.send('Hello');
};

export const authController = {
  register,
};
