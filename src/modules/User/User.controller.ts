// eslint-disable-next-line no-shadow
import type { Request, Response } from 'express';
import type UserService from './User.service.js';
import Validator from '../../core/modules/validation/Validator.js';
import ApiError from '../../core/modules/exceptions/ApiError.js';
import type { UserDTO } from './User.types.js';

export default class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  private async checkNewPasswordBeforeUpdate(
    realPassword: string,
    newPassword: string | undefined,
    currentPassword: unknown,
  ) {
    if (newPassword) {
      if (!Validator.isNotEmptyString(currentPassword)) {
        throw ApiError.BadRequest(
          'Current password is required for changing password. And must be a string',
        );
      }

      const currentPasswordCorrect = await this.userService.passwordEqual(
        currentPassword,
        realPassword,
      );

      if (!currentPasswordCorrect) {
        throw ApiError.BadRequest('Current password is incorrect');
      }

      if (!Validator.isStrongPassword(newPassword)) {
        throw ApiError.BadRequest('Password length must be greater than 8');
      }
    }
  }

  async update(req: Request, res: Response) {
    const { auth } = req.payload;

    if (!auth) {
      throw ApiError.MissingAuthMiddleware();
    }

    const { userId: id } = auth;
    const dataToUpdate = Validator.filterKeys<UserDTO>(req.body as UserDTO, [
      { key: 'name', errMessage: 'Name must be a string', isValid: Validator.isNotEmptyString },
      { key: 'email', errMessage: 'Email is not valid', isValid: Validator.isEmail },
      {
        key: 'password',
        errMessage: 'Password length must be greater than 8',
        isValid: Validator.isStrongPassword,
      },
    ]);

    const user = await this.userService.getById(id);

    if (!user) {
      throw ApiError.ServerError('User not found. Id is incorrect', {
        payload: { id, auth },
      });
    }

    await this.checkNewPasswordBeforeUpdate(
      user.password,
      dataToUpdate.password,
      req.body.currentPassword,
    );

    const updatedUser = await this.userService.updateById(id, dataToUpdate);
    const normalizedUser = this.userService.normalize(updatedUser);

    return res.send({
      message: `User updated successfully`,
      user: normalizedUser,
    });
  }
}
