import { User } from '../models/User.model.js';
import { ApiError } from '../exeptetion/apiError.js';
import bcrypt from 'bcrypt';

const getProfile = async (res, req) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ['id', 'name', 'email'],
  });

  return user;
};

const changeName = async (req, res) => {
  const { newName } = req.body;
  const user = await User.findByPk(req.user.id);

  user.name = newName;

  await user.save();

  res.status(200).send({ message: 'Your name have been changed' });
};

const changePassword = async (res, req) => {
  const { oldPassword, newPasword, confirmPassword } = req.body;

  if (newPasword !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const user = User.findByPk(req.user.id);
  const verifyPassword = bcrypt.compare(user.password, oldPassword);

  if (!verifyPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const hashedPassword = bcrypt.hash(newPasword, 10);

  user.password = hashedPassword;
  await user.save();

  res.status(200).send({ message: 'Your password have been changed' });
};

const changeEmail = async (req, res) => {
  const { password, newEmail, confirmEmail } = req.body;

  if (newEmail !== confirmEmail) {
    throw ApiError.badRequest('Emails do not match');
  }

  const existingEmail = await User.findOne({ where: { email: newEmail } });

  if (existingEmail) {
    throw ApiError.badRequest('This email is registed');
  }

  const user = User.findByPk(req.user.id);
  const verifyPassword = bcrypt.compare(user.password, password);

  if (!verifyPassword) {
    throw ApiError.badRequest('Passwords do not match');
  }

  const html = `
  <h1>Your Email have been changed</h1>
`;

  await emailService.sendActivationEmail(email, html);

  user.email = newEmail;
  await user.save();

  res.status(200).send({ message: 'Check your email' });
};

export const userController = {
  getProfile,
  changeName,
  changePassword,
  changeEmail,
};
