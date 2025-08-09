import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import { v4 as uuidv4 } from 'uuid';

export const updateUserName = async (req, res) => {
  const { name } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    user.name = name;
    await user.save();

    res.json({ message: 'Імʼя оновлено', name });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Невірний поточний пароль' });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    user.passwordHash = hash;
    await user.save();

    res.json({ message: 'Пароль оновлено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const requestEmailChange = async (req, res) => {
  const { newEmail, password } = req.body;

  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Невірний пароль' });
    }

    const token = uuidv4();

    user.emailChangeToken = token;
    user.newEmail = newEmail;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Зміна email',
      html: `<p>Хтось намагається змінити вашу електронну пошту на ${newEmail}. Якщо це не ви — нічого не робіть. Якщо це ви — підтвердьте зміну, перейшовши за <a href="http://localhost:5000/api/user/confirm-email-change/${token}">цим посиланням</a>.</p>`,
    });

    res.json({ message: 'На стару пошту надіслано листа з підтвердженням' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

export const confirmEmailChange = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ where: { emailChangeToken: token } });

    if (!user) {
      return res.status(400).json({ message: 'Невірний токен' });
    }
    user.email = user.newEmail;
    user.newEmail = null;
    user.emailChangeToken = null;
    await user.save();

    res.redirect('/email-changed-success.html');
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера' });
  }
};
