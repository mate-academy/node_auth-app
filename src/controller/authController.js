import { User } from '../models/userModel.js';
import { userServices } from '../services/userServices.js';
import { jwts } from '../services/jwtServices.js';
import { ApiError } from '../exeptions/apiError.js';
import { authServices } from '../services/authServices.js';
import bycrpt from 'bcrypt';
import { tokenServices } from '../services/tokenServices.js';

// aa

const register = async (request, response) => {
  const { name, email, password } = request.body;

  const errors = {
    name: authServices.validateName(name),
    email: authServices.validateEmail(email),
    password: authServices.validadetPassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest('bad request', errors);
  }

  const hashedPass = await bycrpt.hash(password, 10);

  const newUser = await userServices.register(name, email, hashedPass);

  if (newUser) {
    response.send(newUser);
  }
};

const activate = async (request, response) => {
  const { activationToken } = request.params;
  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    response.sendStatus(404);

    return;
  }
  user.activationToken = null;
  await user.save();

  const { normalizedUser, accessToken } = await authServices.generateTokens(
    response,
    user,
  );

  response.send({
    user: normalizedUser,
    accessToken,
  });
};
// colocar o validate password e validade email
const login = async (request, response) => {
  const { email, password } = request.body;

  const errors = {
    email: authServices.validateEmail(email),
    password: authServices.validadetPassword(password),
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest('bad request', errors);
  }

  const user = await userServices.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('Unregistered user', {
      email: 'Unregistered user',
    });
  }

  const isPasswordValid = bycrpt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Incorrect password', {
      password: 'Incorrect password',
    });
  }

  const { normalizedUser, accessToken } = await authServices.generateTokens(
    response,
    user,
  );

  response.send({
    user: normalizedUser,
    accessToken,
  });
};

const recover = async (request, response) => {
  const { email } = request.body;

  const user = await userServices.recover(email);

  return response.status(200).send(user);
};

const changePassword = async (request, response) => {
  const { activationToken } = request.params;
  const { password, confirmation } = request.body;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    throw ApiError.notFound({
      activationToken: 'Invalid or expired recovery token.',
    });
  }

  const errors = {
    password: authServices.validadetPassword(password),
    confirmation: authServices.validateConfirmationPass(password, confirmation),
  };

  if (errors.password || errors.confirmation) {
    throw ApiError.badRequest('Something went wrong', errors);
  }

  const hashedPass = await bycrpt.hash(confirmation, 10);

  user.password = hashedPass;
  user.activationToken = null;

  await user.save();

  return response
    .status(200)
    .send({ message: 'Password updated successfully' });
};

const refresh = async (request, response) => {
  const { refreshToken } = request.cookies;

  const userData = await jwts.verifyRefresh(refreshToken);
  const token = await tokenServices.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userServices.findByEmail(userData.email);

  await authServices.generateTokens(response, user);
};

const logout = async (request, response) => {
  const { refreshToken } = request.cookies;
  const userData = await jwts.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenServices.remove(userData.id);

  response.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true, // true se usar HTTPS
  });

  return response.sendStatus(204);
};

export const authController = {
  register,
  activate,
  login,
  recover,
  changePassword,
  refresh,
  logout,
};
