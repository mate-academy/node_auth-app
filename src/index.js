'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const users = [];

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cookie-parser')());

const getToken = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

const authenticateToken = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const isNotAuthenticated = (req, res, next) => {
  const token = getToken(req);

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (!err) {
        return res.status(400).json({ error: 'Already authenticated' });
      }
      next();
    });
  } else {
    next();
  }
};

// Password validation
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

// Registration
app.post('/register', isNotAuthenticated, async (req, res) => {
  const { name, email, password } = req.body;
  const passwordError =
    'Password must be at least 8 characters and contain ' +
    'uppercase, lowercase, numbers and special characters';

  if (!validatePassword(password)) {
    return res.status(400).json({ error: passwordError });
  }

  const userExists = users.find((u) => u.email === email);

  if (userExists) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = uuidv4();

  const newUser = {
    name,
    email,
    password: hashedPassword,
    active: false,
    activationToken,
  };

  users.push(newUser);

  const activationLink = `${process.env.BASE_URL}/activate/${activationToken}`;

  try {
    await transporter.sendMail({
      to: email,
      subject: 'Activate your account',
      html: `Click <a href="${activationLink}">here</a> to activate`,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send activation email' });
  }

  res.status(201).json({
    message: 'Registration successful. Check your email to activate account.',
  });
});

// Activation
app.get('/activate/:token', isNotAuthenticated, (req, res) => {
  const { token } = req.params;
  const user = users.find((u) => u.activationToken === token);

  if (!user) {
    return res.status(400).json({ error: 'Invalid activation token' });
  }

  user.active = true;
  user.activationToken = null;

  const jwtToken = jwt.sign({ id: user.email }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });

  res.cookie('token', jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.redirect('/profile');
});

// Login
app.post('/login', isNotAuthenticated, async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!user.active) {
    return res
      .status(403)
      .json({ error: 'Please activate your account first' });
  }

  const token = jwt.sign({ id: user.email }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.redirect('/profile');
});

// Logout
app.post('/logout', authenticateToken, (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.redirect('/login');
});

// Password reset request
app.post('/reset-password', isNotAuthenticated, async (req, res) => {
  const { email } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 3600000;

  const resetLink = `${process.env.BASE_URL}/reset-password/${resetToken}`;

  try {
    await transporter.sendMail({
      to: email,
      subject: 'Reset your password',
      html: `Click <a href="${resetLink}">here</a> to reset your password`,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send reset email' });
  }

  res.json({ message: 'Password reset email sent' });
});

// Password reset confirmation
app.post('/reset-password/:token', isNotAuthenticated, async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  const user = users.find(
    (u) => u.resetToken === token && u.resetTokenExpiry > Date.now(),
  );

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Invalid password format' });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetTokenExpiry = null;

  res.json({
    message: 'Password reset successful',
    redirect: '/reset-success',
  });
});

// Reset success page
app.get('/reset-success', (req, res) => {
  res.json({ message: 'Password reset successful', loginLink: '/login' });
});

// Profile
app.get('/profile', authenticateToken, (req, res) => {
  const user = users.find((u) => u.email === req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ name: user.name, email: user.email });
});

// Update profile
app.put('/profile', authenticateToken, async (req, res) => {
  const user = users.find((u) => u.email === req.user.id);
  const {
    name,
    currentPassword,
    newPassword,
    confirmPassword,
    newEmail,
    confirmNewEmail,
  } = req.body;

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const needsPasswordCheck = newPassword || newEmail;
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (needsPasswordCheck && !isPasswordValid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  if (name) {
    user.name = name;
  }

  if (newPassword) {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'Invalid password format' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
  }

  if (newEmail) {
    if (newEmail !== confirmNewEmail) {
      return res.status(400).json({ error: 'New emails do not match' });
    }

    const emailExists = users.find((u) => u.email === newEmail);

    if (emailExists) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const emailChangeToken = uuidv4();

    user.pendingEmail = newEmail;
    user.emailChangeToken = emailChangeToken;
    user.emailChangeExpiry = Date.now() + 3600000;

    const confirmLink = `${process.env.BASE_URL}/confirm-email/${emailChangeToken}`;

    try {
      await transporter.sendMail({
        to: newEmail,
        subject: 'Confirm Email Change',
        html: `Click <a href="${confirmLink}">here</a> to confirm`,
      });

      const notificationText =
        `A request to change your email to ${newEmail} ` +
        "was made. If this wasn't you, please secure your account.";

      await transporter.sendMail({
        to: user.email,
        subject: 'Email Change Request',
        text: notificationText,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'Failed to send confirmation email' });
    }

    return res.json({ message: 'Email confirmation sent to new address' });
  }

  res.json({ message: 'Profile updated successfully' });
});

// Email change confirmation
app.get('/confirm-email/:token', (req, res) => {
  const { token } = req.params;
  const user = users.find(
    (u) => u.emailChangeToken === token && u.emailChangeExpiry > Date.now(),
  );

  if (!user) {
    return res
      .status(400)
      .json({ error: 'Invalid or expired email change token' });
  }

  const oldEmail = user.email;

  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.emailChangeToken = null;
  user.emailChangeExpiry = null;

  (async () => {
    try {
      await transporter.sendMail({
        to: oldEmail,
        subject: 'Email Changed Successfully',
        text: `Your email has been successfully changed to ${user.email}`,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to send email change notification:', error);
    }
  })();

  res.json({ message: 'Email changed successfully' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Page not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // eslint-disable-line no-console
});
