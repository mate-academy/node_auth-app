// eslint-disable-next-line no-shadow
import type { Request, Response } from 'express';
import type UserService from './User.service.js';
import Validator from '../../core/modules/validation/Validator.js';
import ApiError from '../../core/modules/exceptions/ApiError.js';
import type { UserDTO } from './User.types.js';
import { allowedKeysToUpdate } from './User.helper.js';

export default class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async update(req: Request, res: Response) {
    if (!req.payload.auth) {
      throw ApiError.MissingAuthMiddleware();
    }

    const { userId: id } = req.payload.auth;
    const { currentPassword } = req.body;
    const user = await this.userService.getById(id);
    const dataToUpdate = Validator.filterKeys<UserDTO>(req.body as UserDTO, allowedKeysToUpdate);
    const { password: newPassword, email: newEmail } = dataToUpdate;
    const messages = ['User updated successfully'];

    if (!user) {
      throw ApiError.ServerError('User not found. Id is incorrect', {
        payload: { id, auth: req.payload.auth },
      });
    }

    if (newPassword !== undefined) {
      if (!Validator.isNotEmptyString(currentPassword)) {
        throw ApiError.BadRequest('Current password is required for changing password');
      }

      if (!(await this.userService.passwordAreEqual(currentPassword, user.password))) {
        throw ApiError.BadRequest('Provided password is incorrect');
      }

      messages.push('Password changed successfully.');
    }

    if (newEmail !== undefined) {
      if (user.email === newEmail) {
        throw ApiError.BadRequest('You already use this email');
      }

      if (await this.userService.getByEmail(newEmail)) {
        throw ApiError.Conflict('Email is already in use by another user');
      }

      messages.push('Email change confirmation codes have been sent to your new and old emails.');
    }

    const updatedUser = await this.userService.updateById(id, dataToUpdate);

    return res.send({ messages, user: this.userService.normalize(updatedUser) });
  }

  async confirmEmailUpdate(req: Request, res: Response) {
    if (!req.payload.auth) {
      throw ApiError.MissingAuthMiddleware();
    }

    const { userId } = req.payload.auth;
    const { newCode, oldCode } = req.body;

    if (!Validator.isNotEmptyString(newCode) || !Validator.isNotEmptyString(oldCode)) {
      throw ApiError.BadRequest('Old code and new code are required');
    }

    const updatedUser = await this.userService.confirmEmailUpdate(userId, oldCode, newCode);

    return res.send({
      message: 'Email updated successfully',
      user: this.userService.normalize(updatedUser),
    });
  }
}
