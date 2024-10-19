import bcrypt from 'bcrypt';
import { userService } from '../services/user.service.js';
import { User } from '../models/user.js';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    res.send('bad request, wrong validation');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userService.registerUser(name, email, hashedPassword);

  res.send({ message: 'OK' });
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

export const authController = {
  register,
  activate,
};
