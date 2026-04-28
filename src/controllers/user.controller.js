import userService from '../services/user.service.js';

class UserController {
  async registration(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const userData = await userService.registration(name, email, password);

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);

      res.cookie('token', userData.token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
      });

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async activate(req, res, next) {
    try {
      const { token } = req.params;
      const jwtToken = await userService.activate(token);

      res.cookie('token', jwtToken, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.redirect(`${process.env.CLIENT_URL}/profile?activated=true`);
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie('token');

      return res.json({ message: 'Вышли из системы' });
    } catch (e) {
      next(e);
    }
  }

  async getProfile(req, res, next) {
    try {
      const { userId } = req.user;
      const userData = await userService.getProfile(userId);

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async updateName(req, res, next) {
    try {
      const { userId } = req.user;
      const { name } = req.body;
      const updatedUser = await userService.updateName(userId, name);

      return res.json(updatedUser);
    } catch (e) {
      next(e);
    }
  }

  async updatePassword(req, res, next) {
    try {
      const { userId } = req.user;
      const { oldPassword, newPassword } = req.body;

      await userService.updatePassword(userId, oldPassword, newPassword);

      return res.json({ message: 'Пароль успешно обновлен' });
    } catch (e) {
      next(e);
    }
  }

  async updateEmail(req, res, next) {
    try {
      const { userId } = req.user;
      const { password, newEmail } = req.body;

      await userService.updateEmail(userId, password, newEmail);

      return res.json({ message: 'Инструкции отправлены на почту' });
    } catch (e) {
      next(e);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      await userService.forgotPassword(email);

      return res.json({
        message: 'Ссылка для сброса пароля отправлена на почту',
      });
    } catch (e) {
      next(e);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      await userService.resetPassword(token, newPassword);

      return res.json({ message: 'Пароль успешно изменен' });
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();
