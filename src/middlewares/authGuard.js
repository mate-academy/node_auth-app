'use strict';

const jwt = require('jsonwebtoken');

function authGuard(req, res, next) {
  try {
    // 1. Отримуємо заголовок Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: 'Користувач не авторизований (відсутній заголовок)' });
    }

    // 2. Витягуємо сам токен (формат зазвичай "Bearer <token>")
    const accessToken = authHeader.split(' ')[1];

    if (!accessToken) {
      return res
        .status(401)
        .json({ message: 'Користувач не авторизований (відсутній токен)' });
    }

    // 3. Верифікуємо токен за допомогою секретного ключа з .env
    const userData = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);

    if (!userData) {
      return res.status(401).json({ message: 'Недійсний токен' });
    }

    // eslint-disable-next-line max-len
    // 4. Записуємо розшифровані дані користувача в req.user для наступних контролерів
    req.user = userData;

    next();
  } catch (e) {
    return res.status(401).json({
      message: 'Користувач не авторизований або термін дії токена минув',
    });
  }
}

module.exports = authGuard;
