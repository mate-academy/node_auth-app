import { ApiError } from '../../exeptions/api.error.js';
import { hash } from 'bcrypt';
import { User } from '../../models/user.js';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../../services/userValidation.service.js';
import { userService } from '../../services/user.service.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await hash(password, 10);

  await userService.register(name, email, hashedPass);

  res.sendStatus(201);
};

export const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    return res.sendStatus(404);
  }

  user.activationToken = null;
  await user.save();

  return res.redirect(process.env.CLIENT_HOST + '/profile');
};
