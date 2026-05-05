import { User } from '../models/User';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { sendActivationEmail, sendResetPasswordEmail } from './emailService';
import jwt from 'jsonwebtoken';
import { Token } from '../models/Token';
import { isPasswordStrong } from '../utils/validatePassword';

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  const existingUser = await User.findOne({ where: { email: email } });

  if (existingUser) {
    throw new Error('Користувач з таким емейлом уже зареєстрований');
  }

  if (!isPasswordStrong(password)) {
    throw new Error(
      'Пароль повинен містити 8 символів, ' +
        'великі/малі літери, цифри та спецсимволи',
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = uuidv4();

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    activationToken: activationToken,
  });

  await sendActivationEmail(email, activationToken);

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    isActive: newUser.isActive,
  };
};

export const activate = async (activationToken: string) => {
  const user = await User.findOne({
    where: { activationToken: activationToken },
  });

  if (!user) {
    throw new Error('Такого юзера не існує');
  }

  user.isActive = true;
  user.activationToken = null;
  await user.save();
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error('Невірний емейл або пароль');
  }

  if (!user.isActive) {
    throw new Error('Аккаунте ще не активовано');
  }

  const isPassValid = await bcrypt.compare(password, user.password);

  if (!isPassValid) {
    throw new Error('Невірний емейл або пароль');
  }

  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: '15m' },
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: '30d' },
  );

  await Token.create({
    userId: user.id,
    refreshToken: refreshToken,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    },
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken: string) => {
  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as { id: string; email: string };

    const user = await User.findOne({ where: { email: payload.email } });

    if (!user) {
      throw new Error('Користувача не знайдено');
    }

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: '15m' },
    );

    const newRefreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '30d' },
    );

    const tokenData = await Token.findOne({ where: { refreshToken } });

    if (!tokenData) {
      throw new Error('Такого рефреш токена не існує');
    }

    tokenData.refreshToken = newRefreshToken;

    await tokenData.save();

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
      newAccessToken,
      newRefreshToken,
    };
  } catch (error) {
    throw new Error('Рефреш токен застарів');
  }
};

export const logout = async (refreshToken: string) => {
  return Token.destroy({ where: { refreshToken } });
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error('Користувача не знайдено');
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;
  await user.save();

  await sendResetPasswordEmail(email, resetToken);
};

export const resetPassword = async (
  resetToken: string,
  newPassword: string,
) => {
  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    throw new Error('Недійсне або застаріле посилання');
  }

  if (!isPasswordStrong(newPassword)) {
    throw new Error(
      'Пароль повинен містити 8 символів, ' +
        'великі/малі літери, цифри та спецсимволи',
    );
  }

  const hashedPass = await bcrypt.hash(newPassword, 10);

  user.resetToken = null;
  user.password = hashedPass;
  await user.save();
};
