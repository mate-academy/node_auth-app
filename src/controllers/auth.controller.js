import { userService } from '../services/user.service.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';
import { emailService } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { resetTokenService } from '../services/resetToken.service.js';
import { validatePassword } from '../validators/passwordValidator.js';
import { validateName } from '../validators/nameValidator.js';
import { validateEmail } from '../validators/emailValidator.js';
import { emailChangesService } from '../services/emailChanges.service.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPass = await bcrypt.hash(password, 10);

  await userService.createUser({ name, email, password: hashedPass });

  res.statusCode = 201;
  res.send({ message: 'New user created' });
};

const sendActivation = async (req, res) => {
  const { email } = req.body;

  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw ApiError.notFound();
  }

  await emailService.sendActivationEmail({
    email,
    activationToken: user.activationToken,
  });

  res.statusCode = 200;
  res.send({ message: 'The activation email was sent again' });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await userService.getUserByActivationToken({ activationToken });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  user.save();

  await generateTokens(res, user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (user.activationToken) {
    throw ApiError.badRequest(
      'The account is not activated. Please check your mail. You should have received an email with an activation link',
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
};

const resetPassword = async (req, res) => {
  const { email } = req.body;

  const user = await userService.getUserByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const resetPasswordToken = uuidv4();

  await resetTokenService.create(user.id, resetPasswordToken);

  await emailService.sendResetPasswordEmail({ email, resetPasswordToken });

  res.statusCode = 200;
  res.send({ message: 'The reset password email was sent' });
};

const saveNewPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const token = await resetTokenService.getByResetToken(resetToken);

  if (!token) {
    throw ApiError.badRequest(
      'You may have missed some steps when changing your password. Please start from the beginning',
    );
  }

  const now = new Date();

  if (now > token.expiresAt) {
    // add remove resetToken
    await resetTokenService.remove(token.userId);

    throw ApiError.badRequest('Token has expired');
  }

  const errors = {
    password: validatePassword(password),
  };

  if (errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userService.getUserById(token.userId);

  user.password = hashedPassword;
  user.save();

  // add remove resetToken
  await resetTokenService.remove(token.userId);

  res.send({ message: 'works', user });
};

const changeEmail = async (req, res) => {
  const { confirmNewEmailToken } = req.params;

  const changeEmail =
    await emailChangesService.getByConfirmNewEmailToken(confirmNewEmailToken);

  if (!changeEmail) {
    throw ApiError.badRequest('Wrong token to confirm the change of mail');
  }

  const now = new Date();

  if (now > changeEmail.expiresAt) {
    throw ApiError.badRequest('Token has expired');
  }

  const user = await userService.getUserById(changeEmail.userId);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  user.email = changeEmail.newEmail;
  user.save();

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.clearCookie('refreshToken');
  res.sendStatus(204);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const token = await tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.getUserByEmail(userData.email);

  await generateTokens(res, user);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

export const authController = {
  register,
  sendActivation,
  activate,
  login,
  resetPassword,
  saveNewPassword,
  changeEmail,
  logout,
  refresh,
};
