import { AuthService } from '../services/auth.service.js';

const register = async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.sendStatus(400);
  }

  const user = await AuthService.register({ email, name, password });

  res.status(201).json(user);
};

export const AuthController = {
  register,
};
