import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import ApiError from '../../core/modules/exceptions/ApiError.js';
import type { UserModelType } from './User.model.js';
import type User from './User.model.js';
import type { UserDTO, UserServiceConstructor, UserUpdateEmailCacheDTO } from './User.types.js';
import type EmailService from '../Email/Email.service.js';
import type CacheService from '../Cache/Cache.service.js';
import {
  getUpdateEmailLetterForNewEmail,
  getUpdateEmailLetterForOldEmail,
} from '../Email/Email.helpers.js';

export default class UserService {
  private readonly UserModel: UserModelType;
  private readonly emailService: EmailService;
  private readonly cacheService: CacheService;
  private readonly cachePrefix = {
    EMAIL_UPDATE: 'email-change',
  };

  constructor({ UserModel, emailService, cacheService }: UserServiceConstructor) {
    this.UserModel = UserModel;
    this.cacheService = cacheService;
    this.emailService = emailService;
  }

  private getConfirmationCode() {
    return uuid().slice(0, 6);
  }

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

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.emailService.sendPasswordChangedEmail(user.email);
    }

    if (dataToUpdate.email) {
      await this.initEmailUpdate(user, dataToUpdate.email);

      delete dataToUpdate.email;
    }

    await user.update(dataToUpdate);

    return user;
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

  passwordAreEqual(providedPassword: string, userPassword: User['password']) {
    return bcrypt.compare(providedPassword, userPassword);
  }

  private async initEmailUpdate(user: User, newEmail: string) {
    const oldEmailCode = this.getConfirmationCode();
    const newEmailCode = this.getConfirmationCode();

    const updatePrefix = this.cachePrefix.EMAIL_UPDATE;
    const codesKey = `${oldEmailCode}:${newEmailCode}`;
    const cache: UserUpdateEmailCacheDTO = { userId: user.id, newEmail };
    const expires = +(process.env.EMAIL_CHANGE_CODE_EXPIRES_IN ?? 600);

    const newLetter = getUpdateEmailLetterForNewEmail(newEmailCode);
    const oldLetter = getUpdateEmailLetterForOldEmail(oldEmailCode, newEmail);

    await this.cacheService.set(updatePrefix, codesKey, cache, expires);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.emailService.send({ to: user.email, html: oldLetter });
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.emailService.send({ to: newEmail, html: newLetter });
  }

  async confirmEmailUpdate(userId: User['id'], codeOld: string, codeNew: string) {
    const updatePrefix = this.cachePrefix.EMAIL_UPDATE;
    const userCache = await this.cacheService.get<UserUpdateEmailCacheDTO>(
      updatePrefix,
      `${codeOld}:${codeNew}`,
    );

    if (!userCache) {
      throw ApiError.NotFound('Codes are invalid or expired');
    }

    if (userCache.userId !== userId) {
      throw ApiError.Forbidden(
        'You need to send request from account, which email you want to change',
      );
    }

    const user = await this.UserModel.findByPk(userId);

    if (!user) {
      throw ApiError.ServerError('User not found', { payload: { userId, userCache } });
    }

    user.email = userCache.newEmail;

    await user.save();

    return user;
  }
}
