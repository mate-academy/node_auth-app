import { jwts } from './jwtServices.js';
import { tokenServices } from './tokenServices.js';
import { userServices } from './userServices.js';

const validateEmail = (value) => {
  if (!value) {
    return 'The email is mandatory';
  }

  if (!/\S+@\S+\.\S+/.test(value)) {
    return 'The email must be valid';
  }
};

const validadetPassword = (value) => {
  if (!value) {
    return 'The password is mandatory';
  }

  if (value.length < 6) {
    return 'the password must be at least 6 characters long';
  }
};

const validateConfirmationPass = (password, confirmation) => {
  if (!confirmation) {
    return 'Provide a password';
  }

  if (confirmation.length < 6) {
    return 'The password must have 6 digits';
  }

  if (password !== confirmation) {
    return 'The passwords must match';
  }
};

const validateName = (value) => {
  if (!value) {
    return 'The name is mandatory';
  }
};

const generateTokens = async (response, user) => {
  const normalizedUser = userServices.normalized(user);

  const accessToken = jwts.sign(normalizedUser);
  const refreshToken = jwts.signRefresh(normalizedUser);

  await tokenServices.save(normalizedUser.id, refreshToken);

  response.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return { normalizedUser, accessToken };
};

export const authServices = {
  validateEmail,
  validadetPassword,
  validateName,
  validateConfirmationPass,
  generateTokens,
};
