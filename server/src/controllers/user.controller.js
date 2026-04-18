import { User } from "../models/user.js";
import { emailService } from "../services/email.service.js";
import { v4 as uuidv4 } from 'uuid';
import { userService } from "../services/user.service.js";
import bcrypt from 'bcrypt';
import { ApiError } from "../exceptions/api.error.js";

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) return 'Email is required';
  if (!EMAIL_PATTERN.test(value)) return 'Email is not valid';
}

const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'At least 6 characters';
};

const validateName = (value) => {
  if (!value.trim()) return 'Name is required';
};

const updateName = async (req, res) => {
  const { name } = req.body;

  if (validateName(name)) {
    throw ApiError.badRequest('Invalid name')
  }

  const id = req.user.id;

  const user = await User.findByPk(id);

  if (!user) {
    res.sendStatus(404);
    return;
  };

  user.name = name;

  await user.save();
  res.send(userService.normalize(user));
}

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const id = req.user.id;

  const user = await User.findByPk(id);

  if (!user) {
    res.sendStatus(404);
    return;
  };

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (isOldPasswordValid) {
    throw ApiError.badRequest('Invalid password');
  }

  user.password = await bcrypt.hash(newPassword, 10);

  await user.save();
  res.sendStatus(201);
}

const updateEmail = async (req, res) => {
  const { newEmail, password } = req.body;

  const id = req.user.id;

  const user = await User.findByPk(id);

  if (!user) {
    res.sendStatus(404);
    return;
  };

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (isPasswordValid) {
    throw ApiError.badRequest('Invalid password');
  }

  emailService.sendEmailChange(user.email);

  user.email = newEmail;

  await user.save();
  res.sendStatus(201);
}


export const userController = {
  updateName,
  updatePassword,
  updateEmail,
}
