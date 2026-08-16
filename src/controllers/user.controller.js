import { userService } from '../services/user.service.js';
import { ApiError } from '../exceptions/Api.error.js';

async function getAll(req, res) {
  const email = req.user?.email;

  if (!email) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  const users = await userService.findAll({ email });

  return res.send(users.map((user) => userService.normalizeUser(user)));
}

async function getById(req, res) {
  const id = Number(req.params.id);

  if (Number.isInteger(id) === false || id <= 0) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const user = await userService.findById(id);

  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  return res.send(userService.normalizeUser(user));
}

async function updateById(req, res) {
  const id = Number(req.params.id);
  const data = req.body;

  if (Number(req.user.id) !== id) {
    return res.status(403).send({
      message: 'You do not have the required rights to perform this operation.',
    });
  }

  if (Number.isInteger(id) === false || id <= 0) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const { name, newEmail, currentPassword, newPassword } = data;

  if (currentPassword && newPassword) {
    const changedUser = await userService.changePassword({
      id,
      currentPassword,
      newPassword,
    });

    return res.send(userService.normalizeUser(changedUser));
  }

  if (currentPassword && newEmail) {
    const updatedUser = await userService.changeEmail(
      id,
      currentPassword,
      newEmail,
    );

    if (!updatedUser) {
      res.status(404).send({ message: 'User not found' });
    }

    return res.send(userService.normalizeUser(updatedUser));
  }

  if (name) {
    const newUser = await userService.changeName(id, name);

    if (!newUser) {
      res.status(404).send({ message: 'User not found' });
    }

    return res.send(userService.normalizeUser(newUser));
  }

  throw ApiError.badRequest('Not enough parameters to update');
}

export const userController = { getAll, getById, updateById };
