import { meService } from '../services/me.service.js';

export const meController = {
  async getProfile(req, res, next) {
    try {
      const user = await meService.getProfile(req.user.id);

      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  },

  async updateName(req, res, next) {
    try {
      const user = await meService.updateName(req.user.id, req.body.name);

      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  },

  async updatePassword(req, res, next) {
    try {
      await meService.updatePassword(req.user.id, req.body);
      res.status(200).json({ message: 'Password updated' });
    } catch (err) {
      next(err);
    }
  },

  async changeEmailRequest(req, res, next) {
    try {
      await meService.changeEmailRequest(req.user.id, req.body);
      res.status(200).json({ message: 'Email change confirmation sent' });
    } catch (err) {
      next(err);
    }
  },

  async confirmEmailChange(req, res, next) {
    try {
      const { token } = req.query;

      await meService.confirmEmailChange(token);
      res.status(200).json({ message: 'Email successfully changed' });
    } catch (err) {
      next(err);
    }
  },
};
