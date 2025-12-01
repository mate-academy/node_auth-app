import { userService } from '../services/user.service.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  await userService.register({ name, email, password });

  res.send({ message: 'Ok' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  await userService.activate(activationToken);

  res.redirect('/profile');
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.login({ email, password });

  await userService.generateTokens(res, user);

  res.redirect('/profile');
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = await userService.refresh(refreshToken);

  const data = await userService.generateTokens(res, user);

  return res.send(data);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  await userService.logout(refreshToken);

  res.redirect('login');
};

const sendResetPassword = async (req, res) => {
  const { email } = req.body;

  await userService.sendResetPassword(email);

  res.send(`Send reset password email on: ${email}`);
};

const resetPassword = async (req, res) => {
  const { resetPassToken } = req.params;

  await userService.resetPassword(resetPassToken);

  res.sendStatus(200);
};

const setPassword = async (req, res) => {
  const { password, confirmation, resetPassToken } = req.body;

  await userService.setPassword({ password, confirmation, resetPassToken });

  res.status(200).send('The password has been changed, you can now log in.');
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  sendResetPassword,
  resetPassword,
  setPassword,
};
