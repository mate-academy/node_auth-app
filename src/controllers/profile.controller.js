import { ApiError } from '../exeptions/api.errors.js';
import { profileService } from '../services/profile.service.js';
import { normalizedUser } from '../utils/normilizedUser.js';

const getProfile = async (req, res) => {
  const user = await profileService.getProfile(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'Користувача не знайдено' });
  }

  res.send(normalizedUser(user));
};

const changeName = async (req, res) => {
  const user = await profileService.changeName(req.userId, req.body.name);

  res.send(normalizedUser(user));
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  if (!oldPassword || !newPassword || !confirmation) {
    throw ApiError.badRequest('Всі поля повинні бути заповнені');
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Паролі не співпадають');
  }

  const user = await profileService.changePassword(
    req.userId,
    oldPassword,
    newPassword,
    changePassword,
  );

  res.send(normalizedUser(user));
};

const changeEmail = async (req, res) => {
  const { userId } = req;
  const { password, newEmail, confirmNewEmail } = req.body;

  const user = await profileService.changeEmail(
    userId,
    password,
    newEmail,
    confirmNewEmail,
  );

  res.send(normalizedUser(user));
};

export const profileController = {
  getProfile,
  changeName,
  changePassword,
  changeEmail,
};
