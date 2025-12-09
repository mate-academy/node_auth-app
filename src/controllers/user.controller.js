import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { userService } from '../services/user.services.js';
import bcrypt from 'bcrypt';
import { authController } from './auth.controller.js';
import { emailServices } from '../services/mail.services.js';
import { v4 as uuidv4 } from 'uuid';

const getAllActivated = async (req, res) => {
  const user = await userService.getAllActivated();

  res.send(user.map(userService.normalize));
};

const changeName = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (name.length === 0) {
    throw ApiError.badRequest('name is empty');
  }

  if (!userId) {
    throw ApiError.badRequest('unautorized');
  }
  await User.update({ name }, { where: { id: userId } });

  res.json({ message: 'Name updated successfully' });
};

const changePassword = async (req, res) => {
  const { password, newPassword, confirmPassword } = req.body;

  const userId = req.user.id;

  if (!password || !newPassword || !confirmPassword) {
    throw ApiError.badRequest('some passwords are empty');
  }

  if (newPassword !== confirmPassword) {
    throw ApiError.badRequest('New password and confirmation do not match');
  }

  if (!userId) {
    throw ApiError.badRequest('user unatorization');
  }

  const user = await User.findOne({ where: { id: userId } });

  if (!user) {
    throw ApiError.unauthorized('user unauthorized');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  user.password = hashedPass;
 await user.save();
  res.json({ message: 'Password updated successfully' });
};

const changeEmail = async (req, res) => {
  const { email, password } = req.body;
  const userId = req.user.id;

  if (!email || !password) {
    throw ApiError.badRequest('empty email or password');
  }

  const errors = {
    email: authController.validateEmail(email),
  };

  if (errors.email) {
    throw ApiError.badRequest('error email');
  }

  const user = await User.findOne({ where: { id: userId } });

  if (!user) {
    throw ApiError.unauthorized('unauthorized');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('wrong password');
  }

  const token = uuidv4();

  user.resetEmailToken = token;
  user.newEmail = email;
  await user.save();

  await emailServices.sendChangeNewEmail(user.email, email, token);

  res.send({ message: 'email sent' });
};

const confirmNewEmail = async (req, res) => {
  const { token } = req.query;
  const activeToken = uuidv4();

  if (!token) {
    throw ApiError.badRequest('invalid token');
  }

  const findUser = await User.findOne({ where: { resetEmailToken: token } });

  if (!findUser) {
    throw ApiError.badRequest(' user not found');
  }

  findUser.resetEmailToken = null;
  findUser.activationToken = activeToken;
  await findUser.save();
  await emailServices.sendNewEmail(findUser.newEmail, activeToken);

  res.send(200);
};

const finallConfirm = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw ApiError.badRequest('invalid token');
  }

  const findUser = await User.findOne({ where: { activationToken: token } });

  if (!findUser) {
    throw ApiError.badRequest('no user');
  }
  findUser.email = findUser.newEmail;
  findUser.newEmail = null;
  findUser.activationToken = null;
  await findUser.save();
  res.json('email is active now ');
};

export const userController = {
  getAllActivated,
  changeName,
  changePassword,
  changeEmail,
  confirmNewEmail,
  finallConfirm,
};
