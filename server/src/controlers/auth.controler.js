const authService = require("../services/auth.services");
const jwtService = require("../services/jwt.services");
const ApiError = require("../exceptions/ApiError");
const tokenService = require("../services/token.services");
const emailService = require("../services/email.services");
const { v4 } = require("uuid");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await authService.register(email, hashedPassword);

  // #swagger.responses[200] = { description: 'Success' }
  res.send({ message: "OK" });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await authService.getByActivationToken(activationToken);

  if (!user) {
    // #swagger.responses[404] = { description: 'NotFound' }
    throw ApiError.NotFound();
  }

  user.activationToken = null;
  await user.save();

  // #swagger.responses[200] = { description: 'Success' }
  res.send({ message: "OK" });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.getByEmail(email);

  if (!user) {
    // #swagger.responses[400] = { description: 'BadRequest' }
    throw ApiError.BadRequest("No such user");
  }

  if (user.activationToken) {
    // #swagger.responses[403] = { description: 'Forbidden' }
    throw ApiError.Forbidden();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // #swagger.responses[400] = { description: 'BadRequest' }
    throw ApiError.BadRequest("Wrong password", {
      password: "Wrong password",
    });
  }

  // #swagger.responses[200] = { description: 'Success' }
  generateTokens(res, user);
};

const sendEmailForPasswordReset = async (req, res) => {
  const { email } = req.body;

  const existUser = await authService.getByEmail(email);

  if (!existUser) {
    // #swagger.responses[400] = { description: 'BadRequest' }
    throw ApiError.BadRequest("User with this email is not exist");
  }

  const resetPasswordToken = v4();

  await emailService.sendPasswordResetEmail(email, resetPasswordToken);

  existUser.resetPasswordToken = resetPasswordToken;
  await existUser.save();

  res.send({ message: "link to reset password was sent" });
  // #swagger.responses[200] = { description: 'Success' }
};

const checkResetPasswordToken = async (req, res) => {
  const { resetPasswordToken } = req.params;

  await authService.verifyResetPasswordTokenInDB(resetPasswordToken);

  res.send({ message: "OK" });
  // #swagger.responses[200] = { description: 'Success' }
};

const resetPassword = async (req, res) => {
  const { resetPasswordToken } = req.params;
  const { password } = req.body;

  const user = await authService.verifyResetPasswordTokenInDB(
    resetPasswordToken
  );

  const hashedPassword = await bcrypt.hash(password, 10);
  const isPasswordAlreadyUsed = await bcrypt.compare(password, user.password);

  if (isPasswordAlreadyUsed) {
    // #swagger.responses[400] = { description: 'BadRequest' }
    throw ApiError.BadRequest(
      "This password is already in use. Please choose a different one."
    );
  }

  user.resetPasswordToken = null;
  user.password = hashedPassword;
  await user.save();

  res.send({ message: "OK" });
  // #swagger.responses[200] = { description: 'Success' }
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefreshToken(refreshToken);

  if (!userData || !refreshToken) {
    // #swagger.responses[401] = { description: 'Unauthorized' }
    throw ApiError.Unauthorized();
  }

  await tokenService.remove(userData.id);

  res.cookie("refreshToken", "", { maxAge: 0 });
  // #swagger.responses[204] = { description: 'Success' }
  res.sendStatus(204);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefreshToken(refreshToken);
  const token = tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    // #swagger.responses[401] = { description: 'Unauthorized' }
    throw ApiError.Unauthorized();
  }

  const user = await authService.getByEmail(userData.email);

  generateTokens(res, user);
  // #swagger.responses[200] = { description: 'Success' }
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

module.exports = {
  register,
  activate,
  login,
  sendEmailForPasswordReset,
  checkResetPasswordToken,
  resetPassword,
  logout,
  refresh,
};
