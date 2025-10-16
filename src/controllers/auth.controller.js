const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshsecretkey';
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || 'resetsecretkey';

function isValidPassword(password) {
  const minLength = 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    typeof password === 'string' &&
    password.length >= minLength &&
    hasUppercase &&
    hasDigit &&
    hasSpecial
  );
}

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          // eslint-disable-next-line max-len
          'Password must be at least 6 characters long and include uppercase, digit and special symbol',
      });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const activationToken = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: '1d',
    });

    user.activationToken = activationToken;
    await user.save();

    const activationLink = `http://localhost:5000/api/auth/activate/${activationToken}`;

    await sendMail(
      email,
      'Activate your account',
      `Click to activate: ${activationLink}`,
    );

    res.status(201).json({
      message: 'User registered. Please check your email to activate account',
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const activate = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || user.activationToken !== token) {
      return res.status(400).json({ message: 'Invalid activation token' });
    }

    user.isActive = true;
    user.activationToken = null;
    await user.save();

    res.status(200).json({ message: 'Account activated. You can now log in' });
  } catch {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Activate your account first' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
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
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || refreshToken !== user.refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: '15m',
    });

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.sendStatus(204);
    }

    const user = await User.findOne({ where: { refreshToken } });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
    });

    res.sendStatus(204);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'User is not authorized' });
    }

    const resetToken = jwt.sign({ id: user.id }, JWT_RESET_SECRET, {
      expiresIn: '1h',
    });

    user.resetToken = resetToken;
    await user.save();

    const resetLink = `http://localhost:5000/api/auth/reset-password?token=${resetToken}`;

    await sendMail(
      email,
      'Reset your password',
      `Click to reset: ${resetLink}`,
    );

    res
      .status(200)
      .json({ message: 'Please check your mail to reset your password' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Missing token' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      message:
        // eslint-disable-next-line max-len
        'Password must be at least 6 characters long and include uppercase, digit and special symbol',
    });
  }

  try {
    const payload = jwt.verify(token, JWT_RESET_SECRET);
    const user = await User.findByPk(payload.id);

    if (!user || token !== user.resetToken) {
      return res.status(401).json({ message: 'Invalid reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    await user.save();

    res.json({ message: 'Password successfully reset' });
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
