import type { UserModelType } from './User.model.js';
import type { UserDTO } from './User.types.js';

export default class UserService {
  constructor(private readonly UserModel: UserModelType) {}

  async getByEmail(email: string) {
    const user = await this.UserModel.findOne({
      where: { email },
    });

    return user;
  }

  activate(token: string) {
    return this.UserModel.update({ activationToken: null }, { where: { activationToken: token } });
  }

  async add({ email, name, password }: UserDTO) {
    const user = await this.UserModel.create({
      email,
      name,
      password,
    });

    return user;
  }
}
