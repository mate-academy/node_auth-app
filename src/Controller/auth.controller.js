const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshsecretkey';
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || 'resetsecretkey';
const sendMail = require('../SendMail/SendMail');
const { validatePassword } = require('../Utils/validators');

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ where: { email } });
  const { valid, message: passwordError } = validatePassword(password);

  if (!valid) {
    return res.status(400).json({ message: passwordError });
  }

  if (existingUser) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    isActivated: false,
  });

  const activationToken = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: '1d',
  });

  const activationUrl = `http://localhost:5000/api/auth/activate/${activationToken}`;

  await sendMail(
    email,
    'Activate your account',
    `Click the link to activate your account: ${activationUrl}`,
  );

  res.status(201).json({
    message: 'User registered. Please check your email to activate account',
  });
};
const activate = async (req, res) => {
  const { token } = req.params;

  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findByPk(decoded.id);

  if (!user) {
    return res.status(400).json({ message: 'Invalid activation link' });
  }

  if (user.isActivated) {
    res.redirect('/login');
  }

  user.isActivated = true;
  user.activationToken = null;
  await user.save();

  res.redirect('/profile');
};
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  if (!user.isActivated) {
    return res.status(400).json({ message: 'Account not activated' });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
};
const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.sendStatus(204);
  }

  const user = await User.findOne({ where: { refreshToken } });

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' });
  res.sendStatus(204);
};
const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  const user = await User.findByPk(decoded.id);

  if (!user || user.refreshToken !== refreshToken) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  const newAccessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: '15m',
  });

  res.json({ accessToken: newAccessToken });
};
const forgotpassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ message: 'Email not found' });
  }

  const resetToken = jwt.sign({ id: user.id }, JWT_RESET_SECRET, {
    expiresIn: '1h',
  });

  const resetUrl = `http://localhost:5000/api/auth/resetpassword?token=${resetToken}`;

  user.resetToken = resetToken;
  await user.save();

  await sendMail(
    email,
    'Password Reset',
    `Click the link to reset your password: ${resetUrl}`,
  );

  res.status(200).send(`
      <html>
        <head><title>Запит прийнято</title></head>
        <body>
          <h1>Помилання на оновлення паролю надіслано на вашу пошту</h1>
        </body>
      </html>
    `);
};
const resetpassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  const { valid, message: passwordError } = validatePassword(password);

  if (!token) {
    return res.status(400).send(`
      <html>
        <head><title>Помилка скидання паролю</title></head>
        <body>
          <h1>Токен для скидання паролю відсутній</h1>
          <p>Будь ласка, запросіть нове посилання для скидання паролю.</p>
          <a href="/forgot-password">Запросити нове посилання</a>
        </body>
      </html>
    `);
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (!valid) {
    return res.status(400).json({ message: passwordError });
  }

  try {
    const payload = jwt.verify(token, JWT_RESET_SECRET);
    const user = await User.findByPk(payload.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (token !== user.resetToken) {
      return res.json({ message: 'Invalid reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    await user.save();

    res.send(`
      <html>
        <head><title>Пароль оновлено</title></head>
        <body>
          <h1>Ваш пароль успішно оновлено</h1>
          <a href="/login">Увійти з новим паролем</a>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  register,
  activate,
  login,
  logout,
  refresh,
  forgotpassword,
  resetpassword,
};
