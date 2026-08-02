const jwt = require('jsonwebtoken');
const { Token } = require('../models');

class TokenService {
  // 1. Генерація пари токенів
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '30m', // дійсний 30 хвилин
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30d', // дійсний 30 днів
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // 2. Збереження refreshToken у БД
  async saveToken(userId, refreshToken) {
    const tokenData = await Token.findOne({
      where: { userId, type: 'refresh' },
    });

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (tokenData) {
      tokenData.token = refreshToken; // Використовуємо поле 'token'
      tokenData.expiresAt = expiresAt;

      return tokenData.save();
    }

    const token = await Token.create({
      userId,
      token: refreshToken, // Використовуємо поле 'token'
      type: 'refresh',
      expiresAt,
    });

    return token;
  }

  // 3. Видалення токена з БД (при logout)
  async removeToken(refreshToken) {
    const tokenData = await Token.destroy({
      where: { token: refreshToken, type: 'refresh' },
    });

    return tokenData;
  }
}

module.exports = {
  tokenService: new TokenService(),
};
