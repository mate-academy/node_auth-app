import { User } from '../models/User';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const resetName = async (req, res) => {
  try {
    const { newName } = req.body;
    const userId = req.session.userId;

    if (!newName) {
      return res.status(400).json({ message: 'Ім’я не може бути порожнім' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    user.name = newName;
    await user.save();

    return res
      .status(200)
      .json({ message: 'Ім’я успішно оновлено', name: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Помилка на сервері під час реєстрації' });
  }
};

export const changeEmail = async (req, res) => {
  try {
    const { password, newEmail } = req.body;
    const userId = req.session.userId;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Невірний пароль' });
    }

    const checkMail = await User.findOne({ where: { email: newEmail } });

    if (checkMail) {
      return res
        .status(400)
        .json({ message: 'Цей email вже використовується' });
    }

    const oldEmail = user.email;
    user.email = newEmail;
    user.isActive = false;
    user.activationToken = uuidv4();
    await user.save();

    try {
      await mailService.sendEmailChangeNotification(oldEmail, newEmail);

      await mailService.sendActivationMail(newEmail, user.activationToken);
    } catch (mailError) {
      console.error('Помилка відправки пошти:', mailError);
    }

    return res.status(200).json({
      message: 'Email змінено. Будь ласка, активуйте нову пошту.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка на сервері під час реєстрації' });
  }
};
