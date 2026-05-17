'use strict';

import * as userService from '../services/user.service.js';

export const getProfile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.id);

    return res.json({ user });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const changeName = async (req, res) => {
  const { name } = req.body;

  try {
    const user = await userService.changeName(req.user.id, name);

    return res.json({
      message: 'Name updated successfully',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;

  if (!oldPassword || !newPassword || !confirmation) {
    return res.status(400).json({
      message: 'Old password, new password and confirmation are required',
    });
  }

  try {
    await userService.changePassword(req.user.id, {
      oldPassword,
      newPassword,
      confirmation,
    });

    return res.json({
      message: 'Password changed successfully. Please log in again.',
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors,
    });
  }
};

export const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;

  if (!password || !newEmail) {
    return res
      .status(400)
      .json({ message: 'Password and new email are required' });
  }

  try {
    await userService.changeEmail(req.user.id, { password, newEmail });

    return res.json({
      message: 'A confirmation link has been sent to your new email address.',
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};
