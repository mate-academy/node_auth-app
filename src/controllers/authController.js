import cryptoModule from 'crypto';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/email.js';

/**
 * Helper function to create JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Creates and sends JWT token to client
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Validate password match
    if (password !== passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Passwords do not match',
      });
    }

    // Create new user (automatically hashed via pre-save middleware)
    const newUser = await User.create({
      name,
      email,
      password,
    });

    // Create and save activation token
    const activationToken = newUser.createActivationToken();

    await newUser.save({ validateBeforeSave: false });

    // Send activation email
    const activationURL = `${process.env.CLIENT_URL}/activate/${activationToken}`;

    await sendEmail({
      email: newUser.email,
      subject: 'Account Activation (Valid for 24 hours)',
      html: `
        <h1>Welcome to Our App!</h1>
        <p>Please click the link below to activate your account:</p>
        <a href="${activationURL}">Activate Account</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    res.status(201).json({
      status: 'success',
      message: 'Activation token sent to email!',
    });
  } catch (err) {
    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already exists',
      });
    }
    next(err);
  }
};

/**
 * Activate user account
 */
export const activateAccount = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .toString('hex');

    const user = await User.findOne({
      activationToken: hashedToken,
      activationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired',
      });
    }

    // Activate user
    user.active = true;
    user.activationToken = undefined;
    user.activationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Log user in automatically
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password',
      });
    }

    // 3) Check if user is active
    if (!user.active) {
      return res.status(401).json({
        status: 'fail',
        message:
          'Please activate your account. Check your email for activation link.',
      });
    }

    // 4) If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Logout user
 */
export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

/**
 * Handle forgot password request
 */
export const forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'There is no user with that email address.',
      });
    }

    // 2) Generate reset token
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    // 3) Send email with reset token
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        html: `
          <h1>Password Reset Request</h1>
          <p>Forgot your password? Click the link below to reset it:</p>
          <a href="${resetURL}">Reset Password</a>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        `,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      // Reset token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email. Try again later!',
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Reset user password
 */
export const resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .toString('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired and user exists, set new password
    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired',
      });
    }

    if (req.body.password !== req.body.passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Passwords do not match',
      });
    }

    // 3) Update password and clear reset token
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const handleSocialAuthSuccess = (req, res) => {
  try {
    const token = signToken(req.user._id);

    res.cookie('jwt', token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    const redirectUrl = process.env.OAUTH_SUCCESS_REDIRECT || '/profile';

    res.redirect(`${redirectUrl}?token=${token}`);
  } catch (err) {
    console.error('Social auth success handler error:', err);
    res.redirect('/login?error=auth-failed');
  }
};
