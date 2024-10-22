const authService = require('../services/auth.service');

const register = async (req, res) => {
  const userBody = req.body;
  const newUser = await authService.register(userBody);

  res.status(201).send(newUser);
};

const activate = async (req, res) => {
  const { activationToken } = req.params;
  const user = await authService.activate(activationToken);

  res.send(user);
};

const login = async (req, res) => {
  const authData = req.body;
  const responseBody = await authService.login(authData);

  res.send(responseBody);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const responseBody = await authService.refresh(refreshToken);

  res.send(responseBody);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  await authService.logout(refreshToken);

  res.sendStatus(204);
};

const passReset = async (req, res) => {
  const { email } = req.body;
  const updatedUser = await authService.passReset(email);

  res.send(updatedUser);
};

const passResetConfirm = async (req, res) => {
  const { accessToken } = req.params;
  const { newPass, newPassConfirmation } = req.body;
  const newUser = await authService.passResetConfirm(
    accessToken,
    newPass,
    newPassConfirmation,
  );

  res.send(newUser);
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  passReset,
  passResetConfirm,
};
