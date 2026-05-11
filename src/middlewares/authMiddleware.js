import { User } from '../models/User';

export const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        message: 'Користувач не авторизований',
      });
    }

    const user = await User.findByPk(req.session.userId);

    if (!user) {
      return res.status(401).json({ message: 'Користувача не знайдено' });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Будь ласка, активуйте ваш акаунт через пошту',
      });
    }
    req.user = user;

    return next();
  } catch {}
};
