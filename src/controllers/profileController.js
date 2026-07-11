const User = require('../models/User');
const bcrypt = require('bcrypt');
const { sendEmailChangeNotification } = require('../services/mailer');

// Показуємо профіль
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);

    res.render('profile', { user });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Помилка завантаження профілю:', error);
    res.status(500).send('Помилка сервера');
  }
};

// Оновлюємо тільки ім'я
exports.updateName = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findByPk(req.session.userId);

    if (!user) {
      return res.status(404).send('Користувача не знайдено');
    }

    user.name = name;
    await user.save();

    res.redirect('/profile');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Помилка оновлення імені:', error);
    res.status(500).send('Помилка сервера');
  }
};

// Оновлюємо пароль
exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .send('Новий пароль має містити щонайменше 8 символів.');
    }

    // Перевіряємо, чи збігаються нові паролі
    if (newPassword !== confirmNewPassword) {
      return res.status(400).send('Нові паролі не збігаються');
    }

    const user = await User.findByPk(req.session.userId);

    if (!user) {
      return res.status(404).send('Користувача не знайдено');
    }

    // Перевіряємо старий пароль
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).send('Неправильний старий пароль');
    }

    // Хешуємо і зберігаємо новий
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.send(
      '<h2>Пароль успішно змінено!</h2>' +
        '<a href="/profile">Повернутися в профіль</a>',
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Помилка оновлення пароля:', error);
    res.status(500).send('Помилка сервера');
  }
};

// Оновлюємо email
exports.updateEmail = async (req, res) => {
  try {
    const { newEmail, confirmNewEmail, password } = req.body;

    const user = await User.findByPk(req.session.userId);

    if (newEmail !== confirmNewEmail) {
      return res.status(400).send('Адреси email не збігаються');
    }

    if (!user) {
      return res.status(404).send('Користувача не знайдено');
    }

    // Перевіряємо пароль для підтвердження дії
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send('Неправильний пароль');
    }

    // Запам'ятовуємо старий email для листа
    const oldEmail = user.email;

    // Оновлюємо email у базі
    user.email = newEmail;
    await user.save();

    // Відправляємо лист-сповіщення на старий email
    await sendEmailChangeNotification(oldEmail, newEmail);

    res.send(
      '<h2>Email успішно змінено!</h2> ' +
        '<a href="/profile">Повернутися в профіль</a>',
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Помилка оновлення email:', error);
    res.status(500).send('Помилка сервера');
  }
};
