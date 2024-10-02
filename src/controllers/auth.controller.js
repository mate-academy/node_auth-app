import { User } from '../models/User.model.js';
import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  await userService.register(name, email, password);

  res.send({ message: 'Ok, registration completed successfully' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);

  if (!user || user.password !== password) {
    res.sendStatus(401);

    return;
  }

  const normolizedUser = userService.normolize(user);

  const accessToken = jwtService.sign(normolizedUser);

  res.send({
    user: normolizedUser,
    accessToken,
  });
};

export const authController = {
  register,
  activate,
  login,
};
