import { ApiError } from '../exceptions/ApiError.js';
import { userService } from '../services/userService.js';

async function getAll(req, res) {
  const users = await userService.getAllActive();

  res.send(users.map(userService.normalize));
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

async function changeName(req, res) {
  const { name } = req.body;

  if (!name) {
    throw ApiError.BadRequest('Validation error', { name: 'Name is required' });
  }

  const user = await userService.changeName(req.user.id, name);

  res.send(user);
}

async function changePassword(req, res) {
  const { oldPassword, newPassword, confirmation } = req.body;

  const errors = {
    newPassword: validatePassword(newPassword),
    confirmation:
      newPassword !== confirmation ? 'Passwords do not match' : undefined,
  };

  if (errors.newPassword || errors.confirmation) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.changePassword(req.user.id, oldPassword, newPassword);

  res.sendStatus(204);
}

async function changeEmail(req, res) {
  const { password, email } = req.body;

  if (!email) {
    throw ApiError.BadRequest('Validation error', {
      email: 'Email is required',
    });
  }

  if (!password) {
    throw ApiError.BadRequest('Validation error', {
      password: 'Password is required',
    });
  }

  const user = await userService.changeEmail(req.user.id, password, email);

  res.send(user);
}

export const userController = {
  getAll,
  changeName,
  changePassword,
  changeEmail,
};
