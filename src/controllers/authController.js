const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { validationResult, body } = require('express-validator');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Валидация регистрации
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Min 8 characters')
    .matches(/[A-Z]/)
    .withMessage('At least 1 uppercase letter')
    .matches(/[0-9]/)
    .withMessage('At least 1 number')
    .matches(/[!@#$%^&*]/)
    .withMessage('At least 1 special character (!@#$%^&*)'),
];

const getRegister = (req, res) => {
  res.render('auth/register', { errors: [], values: {} });
};

const postRegister = [
  ...registerValidation,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('auth/register', {
        errors: errors.array(),
        values: req.body,
      });
    }

    const { name, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.render('auth/register', {
          errors: [{ msg: 'Email already in use' }],
          values: req.body,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const activationToken = uuidv4();

      const user = new User({
        name,
        email,
        password: hashedPassword,
        activationToken,
      });

      await user.save();

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Activate your account',
        html: `
          <h1>Welcome, ${name}!</h1>
          <p>Click the link below to activate your account:</p>
          <a href="${process.env.BASE_URL}/activate/${activationToken}">
            Activate Account
          </a>
        `,
      });

      return res.render('auth/register-success', { email });
    } catch (error) {
      process.stderr.write(`Register error: ${error.message}\n`);

      return res.render('auth/register', {
        errors: [{ msg: error.message }],
        values: req.body,
      });
    }
  },
];

const activateAccount = async (req, res) => {
  try {
    const user = await User.findOne({ activationToken: req.params.token });

    if (!user) {
      return res.render('auth/activation', { success: false });
    }

    user.isActive = true;
    user.activationToken = null;
    await user.save();

    // Автологин после активации
    req.session.userId = user._id;

    return res.redirect('/profile');
  } catch (error) {
    return res.render('auth/activation', { success: false });
  }
};

const getLogin = (req, res) => {
  res.render('auth/login', { errors: [], values: {} });
};

const postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render('auth/login', {
        errors: [{ msg: 'Invalid email or password' }],
        values: req.body,
      });
    }

    if (!user.isActive) {
      return res.render('auth/login', {
        errors: [
          { msg: 'Please activate your account first. Check your email.' },
        ],
        values: req.body,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render('auth/login', {
        errors: [{ msg: 'Invalid email or password' }],
        values: req.body,
      });
    }

    req.session.userId = user._id;

    return res.redirect('/profile');
  } catch (error) {
    return res.render('auth/login', {
      errors: [{ msg: 'Something went wrong. Try again.' }],
      values: req.body,
    });
  }
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

const getResetPassword = (req, res) => {
  res.render('auth/reset-password', { errors: [], values: {}, sent: false });
};

const postResetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const token = uuidv4();

      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 час
      await user.save();

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset your password',
        html: `
          <p>Click to reset your password:</p>
          <a href="${process.env.BASE_URL}/reset-password/${token}">
            Reset Password
          </a>
          <p>Link expires in 1 hour.</p>
        `,
      });
    }

    return res.render('auth/reset-password', {
      errors: [],
      values: {},
      sent: true,
    });
  } catch (error) {
    return res.render('auth/reset-password', {
      errors: [{ msg: 'Something went wrong.' }],
      values: req.body,
      sent: false,
    });
  }
};

const getNewPassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.render('auth/reset-password', {
      errors: [{ msg: 'Reset link is invalid or expired.' }],
      values: {},
      sent: false,
    });
  }

  return res.render('auth/new-password', {
    errors: [],
    token: req.params.token,
  });
};

const postNewPassword = async (req, res) => {
  const { password, confirmation } = req.body;

  if (password !== confirmation) {
    return res.render('auth/new-password', {
      errors: [{ msg: 'Passwords do not match' }],
      token: req.params.token,
    });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.render('auth/new-password', {
        errors: [{ msg: 'Reset link is invalid or expired.' }],
        token: req.params.token,
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.render('auth/reset-success');
  } catch (error) {
    return res.render('auth/new-password', {
      errors: [{ msg: 'Something went wrong.' }],
      token: req.params.token,
    });
  }
};

const getProfile = async (req, res) => {
  const user = await User.findById(req.session.userId);

  return res.render('profile/index', {
    user,
    errors: [],
    success: null,
  });
};

const updateName = async (req, res) => {
  await User.findByIdAndUpdate(req.session.userId, { name: req.body.name });

  return res.redirect('/profile');
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;
  const user = await User.findById(req.session.userId);
  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    return res.render('profile/index', {
      user,
      errors: [{ msg: 'Old password is incorrect' }],
      success: null,
    });
  }

  if (newPassword !== confirmation) {
    return res.render('profile/index', {
      user,
      errors: [{ msg: 'Passwords do not match' }],
      success: null,
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res.render('profile/index', {
    user,
    errors: [],
    success: 'Password updated successfully!',
  });
};

const updateEmail = async (req, res) => {
  const { password, newEmail, newEmailConfirmation } = req.body;
  const user = await User.findById(req.session.userId);
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.render('profile/index', {
      user,
      errors: [{ msg: 'Password is incorrect' }],
      success: null,
    });
  }

  if (newEmail !== newEmailConfirmation) {
    return res.render('profile/index', {
      user,
      errors: [{ msg: 'Emails do not match' }],
      success: null,
    });
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Your email was changed',
    html: `<p>Your email has been changed to ${newEmail}</p>`,
  });

  user.email = newEmail;
  await user.save();

  return res.render('profile/index', {
    user,
    errors: [],
    success: 'Email updated successfully!',
  });
};

module.exports = {
  getRegister,
  postRegister,
  activateAccount,
  getLogin,
  postLogin,
  logout,
  getResetPassword,
  postResetPassword,
  getNewPassword,
  postNewPassword,
  getProfile,
  updateName,
  updatePassword,
  updateEmail,
};
