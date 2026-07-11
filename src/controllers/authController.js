const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { sendActivationMail } = require('../services/mailer');

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Перевіряємо, чи є вже такий юзер
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).send('Користувач з таким email вже існує');
    }

    // 2. Хешуємо пароль (10 - це salt rounds, стандартна складність)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Генеруємо токен активації
    const activationToken = uuidv4();

    // 4. Створюємо користувача в базі (isActive за замовчуванням false)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      activationToken,
    });

    // 5. Відправляємо лист
    await sendActivationMail(user.email, activationToken);

    // 6. Показуємо сторінку "Перевірте пошту"
    res.render('activate');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Помилка реєстрації:', error);
    res.status(500).send('Помилка сервера під час реєстрації');
  }
};

exports.activateUser = async (req, res) => {
  try {
    const { token } = req.params; // Дістаємо токен з URL

    // 1. Шукаємо користувача з таким токеном
    const user = await User.findOne({ where: { activationToken: token } });

    if (!user) {
      return res.status(400).send('Недійсний або застарілий токен активації.');
    }

    // 2. Активуємо користувача
    user.isActive = true;
    user.activationToken = null;
    await user.save(); // Зберігаємо зміни в базу

    // 3. Перенаправляємо на сторінку профілю
    res.redirect('/profile');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Помилка активації:', error);
    res.status(500).send('Помилка сервера під час активації');
  }
};

exports.getProfile = async (req, res) => {
  try {
    // Поки що просто рендеримо сторінку profile.ejs
    // Пізніше ми передаватимемо сюди дані поточного юзера
    res.render('profile');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Помилка завантаження профілю:', error);
    res.status(500).send('Помилка сервера під час завантаження профілю');
  }
};

// Показуємо сторінку логіну
exports.getLoginPage = (req, res) => {
  res.render('login');
};

// Обробляємо дані з форми логіну
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Шукаємо юзера за email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).send('Користувача з таким email не знайдено.');
    }

    // 2. Перевіряємо пароль через bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send('Неправильний пароль.');
    }

    // 3. Перевіряємо статус активації (завдання з чек-ліста)
    if (!user.isActive) {
      return res
        .status(403)
        .send('Будь ласка, активуйте вашу пошту перед входом.');
    }

    // 4. Усе супер! Записуємо id користувача в сесію
    req.session.userId = user.id;

    // 5. Перенаправляємо в профіль
    res.redirect('/profile');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Помилка логіну:', error);
    res.status(500).send('Помилка сервера під час входу');
  }
};

exports.logoutUser = (req, res) => {
  // Знищуємо сесію
  req.session.destroy((err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error('Помилка логауту:', err);

      return res.status(500).send('Помилка під час виходу з системи');
    }
    // Після успішного видалення сесії кидаємо на сторінку логіну
    res.redirect('/login');
  });
};
