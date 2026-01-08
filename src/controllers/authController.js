'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { models } = require('../models');

const getRegisterPage = (req, res) => {
  res.render('register');
};

const getLoginPage = (req, res) => {
  res.render('login');
};

const getRequestResetPage = (req, res) => {
  res.render('requestReset');
};

const getResetPasswordPage = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await models.User.findOne({ where: { resetToken: token } });

    if (!user) {
      return res.render('requestReset', {
        error: 'Invalid or expired reset link',
      });
    }
    res.render('resetPassword', { token });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.render('requestReset', { error: 'Something went wrong' });
  }
};

const updateName = async (req, res) => {
  const { name } = req.body;
  const userId = req.session.userId;

  try {
    const user = await models.User.findByPk(userId);

    user.name = name;
    await user.save();
    res.render('profile', { user, message: 'Name updated successfully' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    res.redirect('/profile');
  }
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;
  const userId = await req.session.userId;

  try {
    const user = await models.User.findByPk(userId);

    if (!user) {
      res.redirect('/login');
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      return res.render('profile', { user, error: 'Incorrect old password' });
    }

    if (newPassword.length < 6) {
      return res.render('profile', {
        user,
        error: 'New password must be at least 6 characters',
      });
    }

    if (newPassword !== confirmation) {
      return res.render('profile', {
        user,
        error: 'New passwords does not match',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.render('profile', { user, message: 'Password changed successfully' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);

    res.redirect('/profile');
  }
};

const updateEmail = async (req, res) => {
  const { newEmail, password } = req.body;
  const userId = req.session.userId;

  try {
    const user = await models.User.findByPk(userId);

    if (!user) {
      res.redirect('/login');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.render('profile', {
        user,
        error: 'Incorrect password. Email was not changed',
      });
    }

    const existingUser = await models.User.findOne({
      where: { email: newEmail },
    });

    if (existingUser) {
      return res.render('profile', {
        user,
        error: 'This email is already in use',
      });
    }

    const oldEmail = user.email;

    user.email = newEmail;
    await user.save();

    // eslint-disable-next-line no-console
    console.log(
      `NOTICE SENT TO OLD EMAIL [${oldEmail}]: "Your email address has been changed to ${newEmail}."`,
    );

    res.render('profile', { user, message: 'Email updated successfully' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);

    res.redirect('/profile');
  }
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.render('register', { error: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.render('register', {
      error: 'Password must be at least 6 characters',
    });
  }

  try {
    const existingUser = await models.User.findOne({ where: { email } });

    if (existingUser) {
      return res.render('register', {
        error: 'User with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = uuidv4();

    await models.User.create({
      name,
      email,
      password: hashedPassword,
      activationToken,
    });

    // eslint-disable-next-line no-console
    console.log(`SENDING EMAIL TO: ${email}`);

    // eslint-disable-next-line no-console
    console.log(
      `ACTIVATION LINK: http://localhost:3000/activate/${activationToken}`,
    );

    res.render('register', {
      message:
        // eslint-disable-next-line max-len
        'Registration successfull! Please check your email to activate your acount',
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.render('register', { error: 'Something went wrong!' });
  }
};

const activateAcount = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await models.User.findOne({
      where: { activationToken: token },
    });

    if (!user) {
      return res.render('register', {
        error: 'Invalid or expired activation link',
      });
    }

    user.isActive = true;
    user.activationToken = null;
    await user.save();

    req.session.userId = user.id;
    res.redirect('/profile');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);

    // previously was /registation need to check
    res.render('register', {
      error: 'Something went wrong during activation',
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', { error: 'Please provide email and password' });
  }

  try {
    const user = await models.User.findOne({ where: { email } });

    if (!user) {
      return res.render('login', { error: 'Invalid password or email' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.render('login', { error: 'Invalid password or email' });
    }

    if (!user.isActive) {
      return res.render('login', {
        error: 'Please activate your acout via email',
      });
    }

    req.session.userId = user.id;
    res.redirect('/profile');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.render('login', { message: 'Something went wrong' });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await models.User.findOne({ where: { email } });

    if (user) {
      const resetToken = uuidv4();

      user.resetToken = resetToken;
      await user.save();

      // eslint-disable-next-line no-console
      console.log(`SENDING RESET EMAIL TO: ${email}`);

      // eslint-disable-next-line no-console
      console.log(
        `RESET LINK: http://localhost:3000/reset-password/${resetToken}`,
      );

      res.render('resetEmailSent');
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.render('requestReset', { error: 'Something went wrong' });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmation } = req.body;

  try {
    const user = await models.User.findOne({ where: { resetToken: token } });

    if (!user) {
      return res.render('requestReset', {
        token,
        error: 'Invalid or expired reset link',
      });
    }

    if (password.length < 6) {
      return res.render('resetPassword', {
        token,
        error: 'Password must be at least 6 characters',
      });
    }

    if (password !== confirmation) {
      return res.render('resetPassword', {
        token,
        error: 'Passwords do not match',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    await user.save();
    res.render('resetSuccess');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.render('resetPassword', { token, error: 'Something went wrong' });
  }
};

module.exports = {
  getRegisterPage,
  register,
  activateAcount,
  getLoginPage,
  login,
  getRequestResetPage,
  requestPasswordReset,
  getResetPasswordPage,
  resetPassword,
  updateName,
  updatePassword,
  updateEmail,
};
