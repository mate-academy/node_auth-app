// eslint-disable-next-line no-shadow
import type { Request, Response } from 'express';
import type UserService from './User.service.js';
import Validator from '../../core/modules/validation/Validator.js';
import ApiError from '../../core/modules/exceptions/ApiError.js';

export default class UserController {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { name } = req.body;

    if (!Validator.isCorrectNumber(id)) {
      throw ApiError.BadRequest('Id must be a number');
    }

    if (name !== undefined && !Validator.isNotEmptyString(name)) {
      throw ApiError.BadRequest('Name must be a string');
    }

    const updatedUser = await this.userService.updateById(id, { name });
    const normalizedUser = this.userService.normalize(updatedUser);

    return res.send({
      message: `User updated successfully`,
      user: normalizedUser,
    });
  }
}
