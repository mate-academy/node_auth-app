/* eslint-disable max-len */
/* eslint-disable no-console */
const bcrypt = require('bcrypt');
const usersRepository = require('../entity/users.repository');
const emailService = require('../services/email.service');
const { v4: uuidv4 } = require('uuid');

// Використовуємо регулярний вираз для валідації паролю
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Отримано з authenticate middleware
    const user = await usersRepository.getById(userId);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isActivated: user.isActivated,
    });
  } catch (error) {
    console.error('Get Profile Error:', error);

    res
      .status(500)
      .json({ message: 'Помилка на сервері під час отримання профіля' });
  }
};

const updateName = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id; // Отримано з authenticate middleware
    const user = await usersRepository.getById(userId);

    user.name = name;
    await user.save();

    res.json({ message: 'Name updated successfully' });
  } catch (error) {
    console.error('Get Profile Error:', error);

    res
      .status(500)
      .json({ message: 'Помилка на сервері під час отримання профіля' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const userId = req.user.id; // Отримано з authenticate middleware

    // 1. Шукаємо користувача в базі
    const user = await usersRepository.getById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    // 3. Перевіряємо новий пароль за допомогою Regex
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          'Новий пароль занадто слабкий. Додайте велику літеру, цифру та спецсимвол.',
      });
    }

    // 4. Чи збігаються новий пароль і підтвердження
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Нові паролі не збігаються' });
    }

    // 5. Хешуємо новий пароль та зберігаємо
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Пароль успішно оновлено!' });
  } catch (error) {
    console.error('Update Password Error:', error);

    res
      .status(500)
      .json({ message: 'Помилка на сервері під час зміни пароля' });
  }
};

const updateEmail = async (req, res) => {
  try {
    const { password, newEmail, confirmEmail } = req.body;
    const userId = req.user.id;

    // 1. Шукаємо користувача в базі
    const user = await usersRepository.getById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    // 2. Перевірка пароля (ОБОВ'ЯЗКОВО перед зміною пошти)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Невірний поточний пароль' });
    }

    if (newEmail !== confirmEmail) {
      return res.status(400).json({ message: 'Email-адреси не збігаються' });
    }

    // Перевірка, чи не зайнятий новий імейл
    const existingEmail = await usersRepository.getByEmail(newEmail);

    if (existingEmail) {
      return res
        .status(400)
        .json({ message: 'Цей email вже використовується' });
    }

    const newActivationToken = uuidv4();
    const oldEmail = user.email;

    // 4. Оновлюємо через той самий .save(), що й в імені
    user.email = newEmail;
    user.isActivated = false;
    user.activationToken = newActivationToken;
    await user.save();

    // Шлемо листи
    await emailService.sendActivationEmail(newEmail, newActivationToken); // На нову пошту
    await emailService.sendEmailChangeNotification(oldEmail, newEmail); // На стару пошту (інфо)

    // Оскільки ми змінили email та статус, краще розлогінити користувача
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      message:
        'Email змінено. Будь ласка, активуйте його за посиланням у листі на новому імейлі.',
    });
  } catch (error) {
    console.error('Update Email Error:', error);

    res
      .status(500)
      .json({ message: 'Помилка на сервері під час зміни імейлу' });
  }
};

const usersController = {
  getProfile,
  updateName,
  updatePassword,
  updateEmail,
};

module.exports = {
  usersController,
};
