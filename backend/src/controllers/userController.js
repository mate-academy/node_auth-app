import { ApiError } from '../exceptions/ApiError.js';
import { userService } from '../services/userService.js';

const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

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
    oldPassword: !oldPassword ? 'Old password is required' : undefined,
    newPassword: validatePassword(newPassword),
    confirmation:
      newPassword !== confirmation ? 'Passwords do not match' : undefined,
  };

  if (errors.oldPassword || errors.newPassword || errors.confirmation) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.changePassword(req.user.id, oldPassword, newPassword);

  res.sendStatus(204);
}

async function changeEmail(req, res) {
  const { password, email, emailConfirmation } = req.body;

  const errors = {
    password: !password ? 'Password is required' : undefined,
    email: validateEmail(email),
    emailConfirmation:
      !emailConfirmation
        ? 'Email confirmation is required'
        : email !== emailConfirmation
          ? 'Emails do not match'
          : undefined,
  };

  if (errors.password || errors.email || errors.emailConfirmation) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  await userService.changeEmail(req.user.id, password, email);

  res.send({ message: 'Check your new email for the confirmation link' });
}

export const userController = {
  getAll,
  changeName,
  changePassword,
  changeEmail,
};
