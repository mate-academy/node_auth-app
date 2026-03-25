/* eslint-disable no-console */
const jwt = require('jsonwebtoken');

// Зверни увагу: використовуй саме той секрет, яким підписуєш Access Token
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

const authenticate = (req, res, next) => {
  // Дістаємо токен безпосередньо з кук
  const token = req.cookies.accessToken;

  if (!token) {
    // Якщо токена немає в куках — 401
    return res.status(401).json({ message: 'No token provided in cookies' });
  }

  try {
    // Перевіряємо валідність токена
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

    console.log('decoded token is:', decoded);

    // Додаємо дані користувача в об'єкт запиту
    req.user = decoded;

    // Передаємо керування наступному мідлверу/контролеру
    next();
  } catch (err) {
    // Якщо токен прострочений або підроблений
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
};

module.exports = authenticate;
