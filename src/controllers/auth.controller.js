import { StatusCodes } from 'http-status-codes';
import { sendActivationEmail } from '../services/mail.service.js';
import { usersService } from '../services/users.service.js';
import { authService } from '../services/auth.service.js';
import { ApiError } from '../exceptions/api.error.js';
import { validateEmail, validatePassword } from '../utils/validation.js';

async function registerUser(req, res) {
  const { name, email, password } = req.body;

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError || passwordError) {
    throw ApiError.BadRequest('Validation error', {
      email: emailError,
      password: passwordError,
    });
  }

  const userExists = await usersService.getByEmail(email);

  if (userExists) {
    throw ApiError.BadRequest('User already exists', {
      email: 'This e-mail address is used by another user',
    });
  }

  const passwordHash = await authService.hashPassword(password);
  const activationToken = authService.generateActivationToken();

  const user = await usersService.create({
    name,
    email,
    passwordHash,
    activationToken,
  });

  await sendActivationEmail(user.email, activationToken);

  return res.status(StatusCodes.CREATED).send(user);
}

async function activateUser(req, res) {
  const { activationToken } = req.params;
  const user = await usersService.getByActivationToken(activationToken);

  if (!user) {
    throw ApiError.NotFound();
  }

  await usersService.consumeActivationToken(user);

  return res.status(StatusCodes.OK).send(user);
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await usersService.getByEmail(email);

  if (!user) {
    throw ApiError.NotFound();
  }

  if (user.activationToken) {
    throw ApiError.Unauthorized(
      'User is not activated. Please check your email for activation link.',
    );
  }

  const passwordsMatch = await authService.comparePasswords(
    password,
    user.passwordHash,
  );

  if (!passwordsMatch) {
    throw ApiError.Unauthorized();
  }

  const accessToken = authService.createAccessToken({
    id: user.id,
    email: user.email,
  });

  return res
    .status(StatusCodes.OK)
    .send({ id: user.id, email: user.email, accessToken });
}

export const authController = {
  registerUser,
  activateUser,
  loginUser,
};
