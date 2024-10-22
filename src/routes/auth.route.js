import { User } from "../models/user.js";

const register = async (req, res) => {
  const { email, password } = req.body;

  const newUser = await User.create({ email, password });
  res.send(newUser);
};

export const authController = {
  register,
};
