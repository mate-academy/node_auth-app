import { userService } from '../services/user.service.js';
import { authService } from '../services/auth.service.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  await authService.register(name, email, password);

  res.send({ message: 'Registration successful' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const activatedUser = await authService.activate(activationToken);

  res.send(userService.normalize(activatedUser));
};

const sendAuthentication = async (res, user) => {
  const {
    user: normalizedUser,
    accessToken,
    refreshToken,
  } = await authService.authenticate(user);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
  res.send({ user: normalizedUser, accessToken });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.login(email, password);

  await sendAuthentication(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = await authService.refresh(refreshToken);

  await sendAuthentication(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  await authService.logout(refreshToken);

  res.clearCookie('refreshToken');
  res.send({ message: 'Logout successful' });
};

const resetPasswordNotification = async (req, res) => {
  const { email } = req.body;

  await authService.resetPasswordNotification(email);

  res.clearCookie('refreshToken');
  res.send({ message: 'Password reset email sent' });
};

const confirmPasswordReset = async (req, res) => {
  const { passwordResetToken } = req.params;
  const { password, confirmation } = req.body;

  await authService.confirmPasswordReset(
    passwordResetToken,
    password,
    confirmation,
  );

  res.clearCookie('refreshToken');
  res.send({ message: 'Password reset successful' });
};

const confirmEmailChange = async (req, res) => {
  const { pendingEmailToken } = req.params;

  await authService.confirmEmailChange(pendingEmailToken);

  res.clearCookie('refreshToken');
  res.send({ message: 'Email updated successfully' });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  resetPasswordNotification,
  confirmPasswordReset,
  confirmEmailChange,
};
