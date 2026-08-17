import * as authService from '../services/authService.js';

export const register = async (req, res) =>
  res.status(201).json(await authService.registerUser(req.body));

export const login = async (req, res) =>
  res.json(await authService.loginUser(req.body));

export const activate = async (req, res) =>
  res.json(await authService.activateUser(req.params.token));

export const logout = async (req, res) =>
  res.json(await authService.logoutUser(req.body.refreshToken));

export const forgotPassword = async (req, res) =>
  res.json(await authService.requestPasswordReset(req.body.email));

export const resetPassword = async (req, res) => {
  const { password, confirmation } = req.body;

  res.json(
    await authService.resetUserPassword(
      req.params.token,
      password,
      confirmation,
    ),
  );
};

export const refresh = async (req, res) =>
  res.json(await authService.refreshAccessToken(req.body.refreshToken));
export const getMe = async (req, res) =>
  res.json(await authService.getCurrentUser(req.user.userId));
export const changeName = async (req, res) =>
  res.json(await authService.updateUserName(req.user.userId, req.body.name));

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  res.json(
    await authService.updateUserPassword(
      req.user.userId,
      oldPassword,
      newPassword,
      confirmation,
    ),
  );
};

export const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;

  res.json(
    await authService.requestEmailChange(req.user.userId, password, newEmail),
  );
};

export const confirmEmailChange = async (req, res) =>
  res.json(await authService.confirmEmailChange(req.params.token));
