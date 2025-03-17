import { ApiError } from '../exceptions/api.error.js';
import { userService } from '../services/user.service.js';
import { validateName } from '../utils/validateName.js';
import bcrypt from 'bcrypt';
import { validatePassword } from '../utils/validatePassword.js';
import { validateEmail } from '../utils/validateEmail.js';
import { emailService } from '../services/email.service.js';

const getUser = async (userId) => {
  const user = await userService.findById(userId);

  if (!user) {
    throw ApiError.notFound();
  }

  return user;
};

const getProfile = async (req, res) => {
  const user = await getUser(req.user.id);

  const normalizedUser = userService.normalize(user);

  res.send(normalizedUser);
};

const updateName = async (req, res) => {
  const { userName } = req.body;
  const user = await getUser(req.user.id);

  const errors = {
    userName: validateName(userName),
  };

  if (errors.userName) {
    throw ApiError.badRequest('Bad request', errors);
  }

  user.userName = userName;
  await user.save();

  res.send({ message: 'Name updated successfully' });
};

const updatePassword = async (req, res) => {
  const { currPassword, newPassword, confirmation } = req.body;
  const user = await getUser(req.user.id);
  const userPassword = user.password;

  if (!currPassword || !newPassword || !confirmation) {
    throw ApiError.badRequest(
      'Bad request: currPassword, newPassword, confirmation is required',
    );
  }

  const isPasswordEqual = await bcrypt.compare(currPassword, userPassword);

  if (!isPasswordEqual) {
    throw ApiError.badRequest('Bad request', {
      password: 'Wrong password',
    });
  }

  const errors = {
    password: validatePassword(newPassword),
  };

  if (errors.password || errors.confirmation) {
    throw ApiError.badRequest('Bad request', errors);
  }

  if (newPassword !== confirmation) {
    throw ApiError.badRequest('Bad request', {
      password: 'Passwords do not match',
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.send({ message: 'Password updated successfully' });
};

const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const userId = req.user.id;
  const user = await getUser(userId);
  const userPassword = user.password;
  const isSame = await bcrypt.compare(password, userPassword);

  if (!isSame) {
    throw ApiError.badRequest('Wrong password');
  }

  if (user.email === newEmail) {
    throw ApiError.badRequest('The same email address');
  }

  const errors = {
    email: validateEmail(newEmail),
  };

  if (errors.email) {
    throw ApiError.badRequest('Bad request', errors);
  }

  await emailService.send({
    email: user.email,
    subject: 'Your email was changed',
    html: 'If you did not request this change, contact support.',
  });

  await userService.updateEmail(newEmail, userId);

  res.send({ message: 'Email is sent. Confirm your email' });
};

export const profileController = {
  getProfile,
  updateName,
  updatePassword,
  changeEmail,
};
