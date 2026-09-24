'use strict';

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { users } = require('./data/users');

function createServer() {
  const app = express();

  app.use(express.json());

  app.use(
    session({
      secret: 'some-secret-key',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res
        .status(400)
        .send({ message: 'Name, email and password are required' });

      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      res.status(400).send({
        message:
          'Password must be at least 8 characters long, ' +
          'contain one uppercase letter and one digit',
      });

      return;
    }

    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      res.status(400).send({ message: 'Email is already registered' });

      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = jwt.sign({ email }, 'activation-secret-key', {
      expiresIn: '1d',
    });
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      activated: false,
      activationToken,
    };

    users.push(newUser);

    // eslint-disable-next-line no-console
    console.log(
      `Activation link: http://localhost:3000/activate/${activationToken}`,
    );

    res.status(201).send({
      message:
        'User registered. Please check your email to activate your account.',
    });
  });

  app.get('/activate/:token', (req, res) => {
    const { token } = req.params;

    try {
      const decoded = jwt.verify(token, 'activation-secret-key');
      const user = users.find((u) => u.email === decoded.email);

      if (!user) {
        res.status(404).send({ message: 'User not found' });

        return;
      }

      user.activated = true;

      res.send({ message: 'Account activated successfully' });
    } catch (error) {
      res.status(400).send({ message: 'Invalid or expired activation token' });
    }
  });

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);

    if (!user) {
      res.status(401).send({ message: 'Invalid email or password' });

      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      res.status(401).send({ message: 'Invalid email or password' });

      return;
    }

    if (!user.activated) {
      res.status(403).send({ message: 'Please activate your account first' });

      return;
    }

    req.session.userId = user.id;

    res.send({ message: 'Logged in successfully' });
  });

  app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).send({ message: 'Could not log out' });

        return;
      }

      res.send({ message: 'Logged out successfully' });
    });
  });

  app.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    const user = users.find((u) => u.email === email);

    if (!user) {
      res.status(404).send({ message: 'User not found' });

      return;
    }

    const resetToken = jwt.sign({ email }, 'reset-secret-key', {
      expiresIn: '1h',
    });

    user.resetToken = resetToken;

    // eslint-disable-next-line no-console
    console.log(
      `Password reset link: http://localhost:3000/reset-password/${resetToken}`,
    );

    res.send({ message: 'Password reset email sent' });
  });

  app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password, confirmation } = req.body;

    if (!password || !confirmation) {
      res
        .status(400)
        .send({ message: 'Password and confirmation are required' });

      return;
    }

    if (password !== confirmation) {
      res.status(400).send({ message: 'Passwords do not match' });

      return;
    }

    try {
      const decoded = jwt.verify(token, 'reset-secret-key');
      const user = users.find((u) => u.email === decoded.email);

      if (!user || user.resetToken !== token) {
        res.status(400).send({ message: 'Invalid or expired reset token' });

        return;
      }

      user.password = await bcrypt.hash(password, 10);
      user.resetToken = null;

      res.send({ message: 'Password has been reset successfully' });
    } catch (error) {
      res.status(400).send({ message: 'Invalid or expired reset token' });
    }
  });

  function requireAuth(req, res, next) {
    if (!req.session.userId) {
      res.status(401).send({ message: 'You must be logged in' });

      return;
    }

    next();
  }

  app.get('/profile', requireAuth, (req, res) => {
    const user = users.find((u) => u.id === req.session.userId);

    res.send({ id: user.id, name: user.name, email: user.email });
  });

  app.patch('/profile/name', requireAuth, (req, res) => {
    const { name } = req.body;

    if (!name) {
      res.status(400).send({ message: 'Name is required' });

      return;
    }

    const user = users.find((u) => u.id === req.session.userId);

    user.name = name;

    res.send({ message: 'Name updated successfully', name: user.name });
  });

  app.patch('/profile/password', requireAuth, async (req, res) => {
    const { oldPassword, newPassword, confirmation } = req.body;

    if (!oldPassword || !newPassword || !confirmation) {
      res.status(400).send({ message: 'All password fields are required' });

      return;
    }

    if (newPassword !== confirmation) {
      res
        .status(400)
        .send({ message: 'New password and confirmation do not match' });

      return;
    }

    const user = users.find((u) => u.id === req.session.userId);
    const oldPasswordMatches = await bcrypt.compare(oldPassword, user.password);

    if (!oldPasswordMatches) {
      res.status(400).send({ message: 'Old password is incorrect' });

      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);

    res.send({ message: 'Password updated successfully' });
  });

  app.patch('/profile/email', requireAuth, async (req, res) => {
    const { password, newEmail, emailConfirmation } = req.body;

    if (!password || !newEmail || !emailConfirmation) {
      res.status(400).send({
        message: 'Password, new email and confirmation are required',
      });

      return;
    }

    if (newEmail !== emailConfirmation) {
      res
        .status(400)
        .send({ message: 'New email and confirmation do not match' });

      return;
    }

    const user = users.find((u) => u.id === req.session.userId);
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      res.status(400).send({ message: 'Password is incorrect' });

      return;
    }

    const oldEmail = user.email;

    user.email = newEmail;

    // eslint-disable-next-line no-console
    console.log(
      `Notification sent to ${oldEmail}: ` +
        `your email has been changed to ${newEmail}`,
    );

    res.send({ message: 'Email updated successfully', email: user.email });
  });

  app.use((req, res) => {
    res.status(404).send({ message: 'Page not found' });
  });

  return app;
}

module.exports = { createServer };
