import { ApiError } from '../exeptions/api.errors.js';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import { validateEmail, validatePassword } from '../utils/validate.js';

const getProfile = async (userId) => {
  return User.findByPk(userId);
};

const changeName = async (userId, newName) => {
  if (!req.body.name || req.body.name.length < 3) {
    throw ApiError.badRequest(
      "Ім'я користувача повинно містити не менше 3 символів",
    );
  }
  const user = await getProfile(userId);

  if (user.name === newName) {
    throw ApiError.notFound({ message: 'Name is the same' });
  }

  user.name = newName;

  user.save();

  return user;
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await getProfile(userId);

  if (!bcrypt.compareSync(oldPassword, user.password)) {
    throw ApiError.badRequest('Пароль не вірний');
  }

  if (validatePassword(newPassword)) {
    throw ApiError.badRequest('Пароль не відповідає вимогам');
  }

  user.password = bcrypt.hashSync(newPassword, 10);

  await user.save();

  return user;
};
const changeEmail = async (userId, password, newEmail, confirmNewEmail) => {
  const user = await getProfile(userId);

  if (!bcrypt.compareSync(password, user.password)) {
    throw ApiError.badRequest('Пароль не вірний');
  }

  if (newEmail !== confirmNewEmail) {
    throw ApiError.badRequest('Email не співпадає');
  }

  if (validateEmail(newEmail)) {
    throw ApiError.badRequest('Email не відповідає вимогам');
  }

  user.email = newEmail;

  await user.save();

  return user;
};
export const profileService = {
  getProfile,
  changeName,
  changePassword,
  changeEmail,
};
