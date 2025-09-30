import User from '../models/User.js';
import { createSendToken } from './authController.js';
import sendEmail from '../utils/email.js';

/**
 * Get current user's profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user profile information
 */
export const updateProfile = async (req, res, next) => {
  try {
    // Filter out unwanted fields
    const filteredBody = {};
    const allowedFields = ['name', 'avatar']; // Add other allowed fields here

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user password
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    // 1) Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // 2) Verify current password
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(401).json({
        message: 'Your current password is wrong',
      });
    }

    // 3) Check if new passwords match
    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({
        message: 'Passwords do not match',
      });
    }

    // 4) Update password
    user.password = newPassword;
    await user.save();

    // 5) Send new token
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * Update user email address
 */
export const updateEmail = async (req, res, next) => {
  try {
    const { password, newEmail } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    // 1) Verify password
    if (!(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        message: 'Your password is incorrect',
      });
    }

    // 2) Check if email is changing
    if (newEmail === user.email) {
      return res.status(400).json({
        message: 'New email must be different',
      });
    }

    // 3) Check if email exists
    const emailExists = await User.findOne({ email: newEmail });

    if (emailExists) {
      return res.status(400).json({
        message: 'Email already in use',
      });
    }

    // 4) Notify old email
    await sendEmail({
      email: user.email,
      subject: 'Email Change Notification',
      html: `
        <p>Your email has been changed from ${user.email} to ${newEmail}.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `,
    });

    // 5) Update email
    user.email = newEmail;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Add social account to user profile
 */
export const addSocialAccount = async (req, res, next) => {
  try {
    const { provider, providerId } = req.body;
    const user = await User.findById(req.user.id);

    // Check if already linked
    const isLinked = user.socialAccounts.some(
      (acc) => acc.provider === provider && acc.providerId === providerId,
    );

    if (isLinked) {
      return res.status(400).json({
        message: 'Account already linked',
      });
    }

    user.socialAccounts.push({ provider, providerId });
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...user.toObject(),
          password: undefined, // Don't send password back
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Remove social account from user profile
 */
export const removeSocialAccount = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const user = await User.findById(req.user.id);

    // Check authentication methods
    const hasPassword = user.password && user.password !== 'google-auth';
    const hasOtherAccounts = user.socialAccounts.some(
      (acc) => acc.provider !== provider,
    );

    if (!hasPassword && !hasOtherAccounts) {
      return res.status(400).json({
        message: 'Cannot remove last authentication method',
      });
    }

    // Remove the account
    user.socialAccounts = user.socialAccounts.filter(
      (acc) => acc.provider !== provider,
    );
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...user.toObject(),
          password: undefined, // Don't send password back
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
