'use strict';

import * as authService from '../services/auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  signed: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // cookie dura 7 dias
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: 'Name, email and password are required' });
  }

  try {
    await authService.register({ name, email, password });

    return res.status(201).json({
      message: 'Registration successful. Please check your email.',
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors,
    });
  }
};

export const activate = async (req, res) => {
  const { token } = req.params;

  try {
    await authService.activate(token);

    return res.json({
      message: 'Account activated successfully. You can now log in.',
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await authService.login({ email, password });

    res.cookie('userId', user.id, COOKIE_OPTIONS);

    return res.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('userId');

  return res.json({ message: 'Logged out successfully' });
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    await authService.requestPasswordReset(email);

    return res.json({
      message:
        'If that email is registered, a password reset link has been sent.',
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

export const confirmPasswordReset = async (req, res) => {
  const { token } = req.params;
  const { password, confirmation } = req.body;

  if (!password || !confirmation) {
    return res
      .status(400)
      .json({ message: 'Password and confirmation are required' });
  }

  try {
    await authService.resetPassword({ token, password, confirmation });

    return res.json({
      message: 'Password reset successfully.',
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors,
    });
  }
};

export const confirmEmailChange = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await authService.confirmEmailChange(token);

    return res.json({
      message: 'Email changed successfully.',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};
