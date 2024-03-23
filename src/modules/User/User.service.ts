import ApiError from '../../core/modules/exceptions/ApiError.js';
import type { UserModelType } from './User.model.js';
import type User from './User.model.js';
import type { UserDTO } from './User.types.js';

export default class UserService {
  constructor(private readonly UserModel: UserModelType) {}

  async getByEmail(email: string) {
    const user = await this.UserModel.findOne({
      where: { email },
    });

    return user;
  }

  async getById(id: User['id']) {
    const user = await this.UserModel.findByPk(id);

    return user;
  }

  activate(token: string) {
    return this.UserModel.update({ activationToken: null }, { where: { activationToken: token } });
  }

  normalize({ id, email, name }: User) {
    return { id, email, name };
  }

  async add({ email, name, password }: UserDTO) {
    const user = await this.UserModel.create({
      email,
      name,
      password,
    });

    return user;
  }

  async updateById(userId: User['id'], dataToUpdate: Partial<UserDTO>) {
    const user = await this.UserModel.findByPk(userId);

    if (!user) {
      throw ApiError.NotFound('User not found');
    }

    await user.update(dataToUpdate);

    return user;
  }

  async updateByEmail(email: string, dataToUpdate: Partial<UserDTO>) {
    const user = await this.UserModel.findOne({
      where: { email },
    });

    if (!user) {
      throw ApiError.NotFound('User not found');
    }

    await user.update(dataToUpdate);

    return user;
  }
}
