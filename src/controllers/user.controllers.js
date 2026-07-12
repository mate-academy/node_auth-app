import { ApiError } from '../exeptions/api.error.js';
import { userService } from '../services/user.service.js';
import { authController } from './auth.controllers.js';
import { emailService } from '../services/email.service.js';
import bcrypt from 'bcrypt';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

async function getOne(req, res) {
  const { userId } = req.params;
  const user = await userService.getOne(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.activationToken) {
    throw ApiError.notFound('User is not activated');
  }

  res.send(userService.normalize(user));
}

async function update(req, res) {
  const { userId } = req.params;
  const { name, password, newPwd, confirmNewPwd, email, confirmEmail } =
    req.body;
  const user = await userService.getOne(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (email || (newPwd && confirmNewPwd)) {
    const isPwdCorrect = await bcrypt.compare(password, user.password);

    if (!isPwdCorrect) {
      throw ApiError.badRequest('Auth failed', {
        password: 'Incorrect password',
      });
    }

    if (newPwd && confirmNewPwd) {
      const errors = {
        password:
          authController.validatePassword(newPwd) ||
          (newPwd !== confirmNewPwd ? 'Passwords do not match' : undefined),
      };

      if (errors.password) {
        throw ApiError.badRequest('Bad request', errors);
      }
    }

    if (email) {
      const errors = {
        email:
          authController.validateEmail(email) ||
          (email !== confirmEmail ? 'Emails do not match' : undefined),
      };

      if (errors.email) {
        throw ApiError.badRequest('Bad request', errors);
      }
    }
  }

  const oldEmail = user.email;

  await userService.update(userId, name, newPwd, email);

  if (email && email !== oldEmail) {
    await emailService.sendEmailChangeNotification(oldEmail, email);
  }

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
