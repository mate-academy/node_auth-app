const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { User, Token } = require('../models');
const { mailService } = require('./mailService');
const { tokenService } = require('./tokenService');

class UserService {
  async registration(email, password) {
    // 1. Перевіряємо, чи існує користувач
    const candidate = await User.findOne({ where: { email } });

    if (candidate) {
      throw new Error(`Користувач з поштою ${email} вже існує`);
    }

    // 2. Хешуємо пароль
    const hashPassword = await bcrypt.hash(password, 3);

    // 3. Створюємо користувача в БД (використовуємо passwordHash)
    const user = await User.create({
      email,
      passwordHash: hashPassword,
    });

    // 4. Створюємо токен активації та відправляємо лист
    const activationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 години

    await Token.create({
      userId: user.id,
      token: activationToken,
      type: 'activation',
      expiresAt,
    });

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationToken}`
    );

    // 5. Формуємо DTO і ґенеруємо токени
    const userDto = {
      id: user.id,
      email: user.email,
      isActivated: user.isActivated,
    };

    const tokens = tokenService.generateTokens({ ...userDto });

    // 6. Зберігаємо refreshToken у базу
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async login(email, password) {
    // 1. Шукаємо користувача в БД
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error(`Користувача з поштою ${email} не знайдено`);
    }

    // 2. Перевіряємо, чи збігається пароль (з полем passwordHash)
    const isEquals = await bcrypt.compare(password, user.passwordHash);

    if (!isEquals) {
      throw new Error('Невірний пароль');
    }

    // 3. Формуємо payload та ґенеруємо нові токени
    const userDto = {
      id: user.id,
      email: user.email,
      isActivated: user.isActivated,
    };
    const tokens = tokenService.generateTokens({ ...userDto });

    // 4. Оновлюємо refreshToken у БД
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }
}

module.exports = {
  userService: new UserService(),
};
