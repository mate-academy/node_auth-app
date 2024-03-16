const authService = require("../services/auth.services");
const jwtService = require("../services/jwt.services");
const ApiError = require("../exceptions/ApiError");
const tokenService = require("../services/token.services");

const getAll = async (req, res) => {
  const users = await authService.getAll();
  res.send(users);
};

const register = async (req, res) => {
  const { email, password } = req.body;

  await authService.register(email, password);

  res.send({ message: "OK" });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await authService.getByActivationToken(activationToken);

  if (!user) {
    throw ApiError.NotFound();
  }

  user.activationToken = null;
  await user.save();

  res.send({ message: "OK" });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.getByEmail(email);

  if (!user) {
    throw ApiError.BadRequest("No such user");
  }

  if (user.password !== password) {
    throw ApiError.BadRequest("Wrong password");
  }

  if (user.activationToken) {
    throw ApiError.FORBIDDEN();
  }

  generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefreshToken(refreshToken);

  console.log(userData, refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.Unauthorized();
  }

  await tokenService.remove(userData.id);
  res.sendStatus(204);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefreshToken(refreshToken);
  const token = tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.Unauthorized();
  }

  const user = await authService.getByEmail(userData.email);

  generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normilizedUser = authService.normalize(user);

  const accessToken = jwtService.sign(normilizedUser);
  const refreshToken = jwtService.signRefresh(normilizedUser);

  await tokenService.save(normilizedUser.id, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.send({
    user: normilizedUser,
    accessToken,
  });
};

module.exports = { getAll, register, activate, login, logout, refresh };
