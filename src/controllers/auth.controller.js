import errors from '../errors/index.error.js';
import models from '../models/index.model.js';
import services from '../services/index.service.js';
import normalize from '../utils/normalize.utils.js';

const login = async (req, res) => {
  const user = await services.auth.login(req.body);

  generateTokens(res, user);
};

const logout = async (req, res) => {
  const token = { refresh: req.cookies.refreshToken } || {
    token: req.headers.authorization?.split(' ')[1],
  };

  await services.auth.logout(token);

  res.status(204).send();
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies;

  const user = services.jwt.refreshVerify(refreshToken);

  if (!user) {
    throw errors.unauthorized();
  }

  generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizeUser = normalize(user.dataValues, [
    'password',
    'createdAt',
    'updatedAt',
  ]);

  const accessToken = services.jwt.sign(normalizeUser);
  const refreshToken = services.jwt.refreshSign(normalizeUser);

  await models.auth.update(
    { token: accessToken, refresh: refreshToken },
    { where: { userId: user.id } },
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: 12 * 60 * 60 * 1000,
  });

  res.send({ user: normalizeUser, accessToken });
};

const activate = async (req, res) => {
  await services.auth.activate(req.params);
  res.send({ info: 'Account activated with success' });
};

const authController = {
  login,
  logout,
  activate,
  refresh,
};

export default authController;
