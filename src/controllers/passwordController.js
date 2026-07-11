const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { sendResetMail } = require('../services/mailer');
const bcrypt = require('bcrypt');

// 1. Показуємо сторінку вводу email
exports.getRequestPage = (req, res) => {
  res.render('reset-password/request');
};

// 2. Обробляємо POST запит з email-ом
exports.sendResetLink = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Якщо юзера немає — краще не казати про це прямо (безпека),
    // просто показуємо ту саму сторінку успіху
    if (!user) {
      return res.render('reset-password/email-sent');
    }

    // Генеруємо токен і час його смерті (1 година від зараз)
    const resetToken = uuidv4();
    const expireTime = new Date(Date.now() + 60 * 60 * 1000);

    // Зберігаємо в базу
    user.resetToken = resetToken;
    user.resetExpires = expireTime;
    await user.save();

    // Відправляємо лист
    await sendResetMail(user.email, resetToken);

    // Показуємо сторінку успіху
    res.render('reset-password/email-sent');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Помилка скидання пароля:', error);
    res.status(500).send('Помилка сервера');
  }
};

// 3. Показуємо форму введення нового пароля (при кліку з листа)
exports.getResetPage = async (req, res) => {
  try {
    const { token } = req.params;

    // Шукаємо юзера за токеном
    const user = await User.findOne({ where: { resetToken: token } });

    if (!user || user.resetExpires < new Date()) {
      return res
        .status(400)
        .send(
          'Токен недійсний або його час дії (1 година) ' +
            'вийшов. Зробіть новий запит.',
        );
    }

    // Усе добре — рендеримо форму і передаємо їй токен
    res.render('reset-password/confirm', { token });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Помилка перевірки токена:', error);
    res.status(500).send('Помилка сервера');
  }
};

// 4. Зберігаємо новий пароль у базу
exports.updatePassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Перевіряємо, чи збігаються паролі
    if (password !== confirmPassword) {
      return res.status(400).send('Паролі не збігаються. Спробуйте ще раз.');
    }

    // Знову шукаємо юзера за правильним полем resetToken
    const user = await User.findOne({ where: { resetToken: token } });

    if (!user || user.resetTokenExpires < new Date()) {
      return res.status(400).send('Токен недійсний або прострочений.');
    }

    // Хешуємо новий пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Оновлюємо дані користувача і зачищаємо токени
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.send(
      '<h2>Пароль успішно змінено! 🎉</h2> ' +
        '<a href="/login">Увійти з новим паролем</a>',
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Помилка оновлення пароля:', error);
    res.status(500).send('Помилка сервера');
  }
};
