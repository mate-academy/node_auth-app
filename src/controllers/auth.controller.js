import { ApiError } from '../exceptions/api.error.js';
import { User } from '../models/user.js';
import { emailService } from '../services/email.service.js';
import { jwtService } from '../services/jwt.service.js';
import { userService } from '../services/user.service.js';
import { v4 as uuidv4 } from 'uuid';

const register = async (req, res) => {
  const { email, password } = req.body;

  const activationToken = uuidv4();
  const newUser = await User.create({ email, password, activationToken }).then(
    userService.normalize,
  );
  await emailService.sendActivationEmail(email, activationToken);
  res.send(newUser);
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  console.log(req.params);
  const user = await User.findOne({ where: { activationToken } }).then(
    userService.normalize,
  );

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
    res.send(401);

    return;
  }

  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

export const authController = {
  register,
  activate,
  login,
};
