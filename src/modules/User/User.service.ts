import bcrypt from 'bcrypt';
import ApiError from '../../core/modules/exceptions/ApiError.js';
import type { UserModelType } from './User.model.js';
import type User from './User.model.js';
import type { UserDTO } from './User.types.js';

export default class UserService {
  constructor(private readonly UserModel: UserModelType) {}

  private getEncryptedPassword(password: string) {
    const saltRounds = +(process.env.BCRYPT_SALT_ROUNDS ?? 10);

    return bcrypt.hash(password, saltRounds);
  }

  private async update(user: User | null, dataToUpdate: Partial<UserDTO>) {
    if (!user) {
      throw ApiError.NotFound('User not found');
    }

    if (dataToUpdate.password) {
      dataToUpdate.password = await this.getEncryptedPassword(dataToUpdate.password);
    }

    await user.update(dataToUpdate);

    return user;
  }

  passwordEqual(password: string, encryptedPassword: string) {
    return bcrypt.compare(password, encryptedPassword);
  }

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
    const encryptedPassword = await this.getEncryptedPassword(password);
    const user = await this.UserModel.create({
      email,
      name,
      password: encryptedPassword,
    });

    return user;
  }

  async updateById(userId: User['id'], dataToUpdate: Partial<UserDTO>) {
    const user = await this.UserModel.findByPk(userId);

    return this.update(user, dataToUpdate);
  }

  async updateByEmail(email: string, dataToUpdate: Partial<UserDTO>) {
    const user = await this.UserModel.findOne({
      where: { email },
    });

    return this.update(user, dataToUpdate);
  }
}
