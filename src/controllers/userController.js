import { userService } from '../services/userService.js';
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await userService.create({ name, email, password });

  res.json(user);
};

export const activate = async (req, res) => {
  const { token } = req.params;

  const user = await userService.getByActivationToken(token);

  if (!user) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  await userService.activate(user);

  res.json({ message: 'Activated' });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.getByEmail(email);

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  if (!user.isActivated) {
    return res.status(400).json({ message: 'Activate account' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Wrong password' });
  }

  res.json({ message: 'Login success' });
};
