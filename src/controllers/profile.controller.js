import { userService } from '../services/user.service.js';

const getProfile = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = await userService.getProfile(refreshToken);

  res.send(userService.normalize(user));
};

const nameUpdate = async (req, res) => {
  const { name } = req.body;
  const { refreshToken } = req.cookies;

  await userService.nameUpdate({ refreshToken, name });

  res.sendStatus(200);
};

const emailUpdate = async (req, res) => {
  const { password, newEmail, confirmEmail } = req.body;
  const { refreshToken } = req.cookies;

  await userService.emailUpdate({
    refreshToken,
    password,
    newEmail,
    confirmEmail,
  });

  res.sendStatus(200);
};

const passwordUpdate = async (req, res) => {
  const { password, newPassword, confirmPassword } = req.body;
  const { refreshToken } = req.cookies;

  await userService.passwordUpdate({
    refreshToken,
    password,
    newPassword,
    confirmPassword,
  });

  res.sendStatus(200);
};

export const profileController = {
  getProfile,
  nameUpdate,
  emailUpdate,
  passwordUpdate,
};
