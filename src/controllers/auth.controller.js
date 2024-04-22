const { ERRORS } = require('../const/errors');
const { UsersService } = require('../services/users.service');
const { JwtService } = require('../services/jwt.service');
const { ValidatorHelper } = require('../helpers/validator');
const { ApiError } = require('../exceptions/api.error');
const { TokenService } = require('../services/token.service');
const { compare, createHash } = require('../helpers/bcrypt');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: ValidatorHelper.validateName(name),
    email: ValidatorHelper.validateEmail(email),
    password: ValidatorHelper.validatePassword(password),
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await createHash(password);

  const newUser = await UsersService.create(email, hashedPassword, name);

  res.status(201);
  res.send(UsersService.normalize(newUser));
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await UsersService.getByQuery({ activationToken });

  if (!user) {
    res.status(404);

    return;
  }

  user.activationToken = null;
  await user.save();

  res.status(204);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw ApiError.badRequest(ERRORS.EMAIL_REQUIRED);
  }

  if (!password) {
    throw ApiError.badRequest(ERRORS.PASSWORD_REQUIRED);
  }

  const user = await UsersService.getByQuery({ email });

  if (!user) {
    throw ApiError.badRequest(ERRORS.INCORRECT_EMAIL_PASSWORD);
  }

  if (user.activationToken) {
    throw ApiError.badRequest(ERRORS.UNACTIVATED_ACCOUNT);
  }

  const isPasswordValid = await compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest(ERRORS.INCORRECT_EMAIL_PASSWORD);
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await JwtService.verifyRefresh(refreshToken);
  const token = await TokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  await generateTokens(res, userData);
};

const generateTokens = async (res, user) => {
  const normalizedUser = UsersService.normalize(user);

  const accessToken = JwtService.sign(normalizedUser);
  const refreshToken = JwtService.signRefresh(normalizedUser);

  await TokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await JwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await TokenService.remove(userData.id);

  res.sendStatus(204);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await UsersService.getByQuery({ email });

  if (!user) {
    throw ApiError.unauthorized(ERRORS.USER_NOT_FOUND);
  }

  await UsersService.forgotPassword(user);

  res.sendStatus(200);
};

const resetPassword = async (req, res) => {
  const { activationToken } = req.params;

  const { password, confirmation } = req.body;

  const errors = {
    password: ValidatorHelper.validatePassword(password),
  };

  if (errors.password) {
    throw ApiError.BadRequest(ERRORS.VALIDATION_ERROR, errors);
  }

  if (password !== confirmation) {
    throw ApiError.BadRequest(ERRORS.PASSWORDS_DO_NOT_MATCH);
  }

  await UsersService.resetPassword(activationToken, password);

  res.sendStatus(200);
};

module.exports = {
  AuthController: {
    register,
    activate,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
  },
};
