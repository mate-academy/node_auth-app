import { ApiError } from '../exeptions/api.error.js';
import { userService } from '../services/user.service.js';
import { authController } from './auth.controllers.js';
import bcrypt from 'bcrypt';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

async function getOne(req, res) {
  const { userId } = req.params;
  const user = await userService.getOne(userId);

  const errors = {
    user:
      (user.activationToken ? 'user is not activated' : undefined) ||
      (!user ? 'user not found' : undefined),
  };

  if (errors.user) {
    throw ApiError.notFound(errors);
  }

  res.send(userService.normalize(user));
}

async function update(req, res) {
  const { userId } = req.params;
  const { name, password, newPwd, confirmNewPwd, email } = req.body;
  const user = await userService.getOne(userId);

  if (email || (newPwd && confirmNewPwd)) {
    const isPwdCorrect = await bcrypt.compare(password, user.password);

    if (!isPwdCorrect) {
      throw ApiError.badRequest('Auth failed', {
        password: 'Incorrect password',
      });
    }

    const errors = {
      password:
        authController.validatePassword(newPwd) ||
        (newPwd !== confirmNewPwd ? 'Passwords do not match' : undefined),
    };

    if (errors.password) {
      throw ApiError.badRequest('Bad request', errors);
    }
  }

  await userService.update(userId, name, newPwd, email);

  const updatedUser = await userService
    .getOne(userId)
    .then(userService.normalize);

  res.send(updatedUser);
}

export const userController = {
  getAllActivated,
  update,
  getOne,
};
