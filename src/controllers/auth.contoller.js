import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';

function validateEmail(email) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!email) {
    return 'Email is required';
  }

  if (!emailPattern.test(email)) {
    return 'Email is not valid';
  }
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }
}

const register = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(errors).some((error) => error)) {
    return res.status(400).json({
      errors,
      message: 'Validation error',
    });
  }

  const existingUser = await userService.getByEmail(email);

  if (existingUser) {
    return res.status(400).json({
      errors: { email: 'Email is already taken' },
      message: 'Validation error',
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await userService.create(email, hashPassword);

  res.send(newUser);
};

export const authController = {
  register,
};
