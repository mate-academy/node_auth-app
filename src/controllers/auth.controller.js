import bcrypt from 'bcrypt';
import * as userService from '../services/user.service.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userService.create({ name, email, passwordHash });

  res.status(201).send({ id: user.id, name: user.name, email: user.email });
};
