import { ApiError } from '../exception/api.error.js';
import { userService } from '../services/user.service.js';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

function validateName(value) {
  if (!value) {
    return 'Name is required';
  }

  if (value.includes(' ')) {
    return 'One word required';
  }

  if (value.length < 2) {
    return 'At least 2 characters';
  }
}

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

const changeName = async (req, res) => {
  const { newName } = req.body;
  const { userId } = req.params;

  if (validateName(newName)) {
    throw ApiError.badRequest(validateName(newName));
  }

  await userService.changeNameService(userId, newName);

  res.status(201).send('Name has been changed');
};

const changeUserPassword = async (req, res) => {
  const { userId } = req.params;
  const { oldPassword, password, confirmation } = req.body;

  if (password !== confirmation) {
    throw ApiError.badRequest(
      'Values of new password and confirmation should match',
    );
  }

  if (validatePassword(oldPassword)) {
    throw ApiError.badRequest(validatePassword(oldPassword));
  }

  await userService.changeUserPassword(userId, oldPassword, password);

  res.status(201).send('Password has been changed');
};

const changeEmail = async (req, res) => {
  const { userId } = req.params;
  const { newEmail, password } = req.body;

  if (validateEmail(newEmail)) {
    throw ApiError.badRequest(validateEmail(newEmail));
  }

  if (validatePassword(password)) {
    throw ApiError.badRequest(validatePassword(password));
  }

  await userService.changeEmail(userId, newEmail, password);

  res.status(201).send('Email has been changed');
};

export const userController = {
  getAllActivated,
  changeName,
  changeUserPassword,
  changeEmail,
};
