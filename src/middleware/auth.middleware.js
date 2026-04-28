import tokenService from '../services/token.service.js';

export default function (req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    const userData = tokenService.validateToken(token);

    if (!userData) {
      return res.status(401).json({ message: 'Невалидный токен' });
    }

    req.user = userData;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Пользователь не авторизован' });
  }
}
