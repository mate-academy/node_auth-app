import { userService } from '../services/user.service.js';
import { ApiError } from '../exceptions/api.error.js';

const getAllActivated = async (request, response) => {
  const users = await userService.getAllActivated();

  response.send(users.map(userService.normalize));
};

const getProfile = async (request, response) => {
  const user = await userService.findById(request.user.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  response.send(userService.normalize(user));
};

const changeName = async (request, response) => {
  const { name } = request.body;

  if (!name) {
    throw ApiError.badRequest('Name is required');
  }

  const user = await userService.updateName(request.user.id, name);

  response.send(userService.normalize(user));
};

const changePassword = async (request, response) => {
  const { oldPassword, password, confirmation } = request.body;

  if (!oldPassword || !password || !confirmation) {
    throw ApiError.badRequest(
      'Old password, password and confirmation are required',
    );
  }

  if (password !== confirmation) {
    throw ApiError.badRequest('Passwords do not match', {
      confirmation: 'Passwords do not match',
    });
  }

  await userService.changePassword(request.user.id, oldPassword, password);

  response.send({ message: 'Password changed successfully' });
};

const changeEmail = async (request, response) => {
  const { password, newEmail } = request.body;

  if (!password || !newEmail) {
    throw ApiError.badRequest('Password and new email are required');
  }

  await userService.requestEmailChange(request.user.id, newEmail, password);

  response.send({ message: 'Check your new email for confirmation' });
};

export const userController = {
  getAllActivated,
  getProfile,
  changeName,
  changePassword,
  changeEmail,
};
