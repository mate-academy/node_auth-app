import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../exceptions/api.error.js';
import { userService } from '../services/user.service.js';
import { validateEmail, validatePassword } from '../utils/validation.js';
import bcrypt from 'bcrypt';
import { emailService } from '../services/email.service.js';

const getUser = async (req, res) => {
  const { email } = req.body;

  const user = await userService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  res.send(userService.normalize(user));
};

const changeName = async (req, res) => {
  const { newName } = req.body;

  const userId = req.user.id;
  const user = await userService.findById(userId);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  if (!newName) {
    throw ApiError.badRequest('The name cannot be empty');
  }

  if (user.name === newName) {
    throw ApiError.badRequest("You can't change the name to the same one.");
  }

  const updatedUser = await userService.changeName(user.email, newName);

  res.send(userService.normalize(updatedUser));
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const userId = req.user.id;
  const user = await userService.findById(userId);

  if (!user || !currentPassword || !newPassword) {
    throw ApiError.badRequest();
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const isNewPasswordValid = await bcrypt.compare(newPassword, user.password);

  if (isNewPasswordValid) {
    throw ApiError.badRequest(
      'The new password must be different from the old one.',
    );
  }

  const errors = {
    password: validatePassword(newPassword),
  };

  if (errors.password) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 5);

  await userService.changePassword(user.email, hashedPassword);

  res.sendStatus(200);
};

const changeEmail = async (req, res) => {
  const { newEmail, password } = req.body;

  if (!newEmail || !password) {
    throw ApiError.badRequest();
  }

  const userId = req.user.id;

  const user = await userService.findById(userId);

  if (!user) {
    throw ApiError.badRequest('No such user');
  }

  const checkEmail = await userService.findByEmail(newEmail);

  if (checkEmail) {
    throw ApiError.badRequest('User already exist');
  }

  const errors = {
    email: validateEmail(newEmail),
  };

  if (errors.email) {
    throw ApiError.badRequest(errors.email, errors);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const securityToken = uuidv4();
  const changeToken = uuidv4();

  const EXPIRE_IN_24H = 24 * 60 * 60 * 1000;
  const securityExpiresAt = new Date(Date.now() + EXPIRE_IN_24H);

  await emailService.sendSecurityEmail(user.email, securityToken);
  await userService.securityEmail(
    user.id,
    securityToken,
    user.email,
    securityExpiresAt,
  );

  await emailService.sendActivationEmail(newEmail, changeToken);

  const updatedUser = await userService.changeEmail(
    userId,
    newEmail,
    changeToken,
  );

  res.status(200);
  res.send({
    user: userService.normalize(updatedUser),
    message: `Email is updated on ${newEmail}`,
  });
};

export const userController = {
  getUser,
  changeName,
  changePassword,
  changeEmail,
};
