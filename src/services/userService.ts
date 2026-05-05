import { User } from '../models/User';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { sendActivationEmail, sendEmailChangeNotif } from './emailService';
import { isPasswordStrong } from '../utils/validatePassword';

export const changeName = async (email: string, newName: string) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error('Користувача не існує');
  }

  user.name = newName;
  await user.save();
};

export const changePassword = async (
  email: string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error('Користувача не існує');
  }

  const valid = await bcrypt.compare(oldPassword, user.password);

  if (!valid) {
    throw new Error('Невірний старий пароль');
  }

  if (!isPasswordStrong(newPassword)) {
    throw new Error(
      'Пароль повинен містити 8 символів,' +
        ' великі/малі літери, цифри та спецсимволи',
    );
  }

  const hashedNewPass = await bcrypt.hash(newPassword, 10);

  user.password = hashedNewPass;
  await user.save();
};

export const changeEmail = async (
  oldEmail: string,
  newEmail: string,
  password: string,
) => {
  const user = await User.findOne({ where: { email: oldEmail } });

  if (!user) {
    throw new Error('Користувача не існує');
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw new Error('Невірний пароль');
  }

  const newActivationToken = uuidv4();

  user.email = newEmail;
  user.activationToken = newActivationToken;
  user.isActive = false;

  await user.save();

  await sendActivationEmail(newEmail, user.activationToken);
  await sendEmailChangeNotif(oldEmail);
};
