import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db.js';
import jwt from 'jsonwebtoken';
import { sendActivationMail } from '../utils/mailService.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    if (userCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ message: 'User with this email already exists.' });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters' +
          ' long and contain at least one number.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const activationToken = uuidv4();

    const query = `
      INSERT INTO users (name, email, password_hash, is_activated, activation_token)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    const values = [name, email, passwordHash, false, activationToken];

    await pool.query(query, values);

    res.status(201).json({
      message:
        'Registration successful! ' +
        'Please check your email to activate your account.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

export const activate = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE activation_token = $1',
      [token],
    );

    if (user.rows.length === 0) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired activation link.' });
    }

    await pool.query(
      'UPDATE users SET is_activated = true,' +
        ' activation_token = null WHERE activation_token = $1',
      [token],
    );

    res
      .status(200)
      .json({ message: 'Account activated successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.is_activated) {
      return res
        .status(403)
        .json({ message: 'Please activate your email before logging in.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '30m' },
    );

    res.status(200).json({
      message: 'Login successful!',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res
        .status(404)
        .json({ message: 'User with this email not found.' });
    }

    const resetToken = uuidv4();

    await pool.query(
      'UPDATE users SET activation_token = $1 WHERE email = $2',
      [resetToken, email],
    );

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    await sendActivationMail(email, resetLink);

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword, confirmation } = req.body;

  if (newPassword !== confirmation) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE activation_token = $1',
      [token],
    );

    if (user.rows.length === 0) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired reset token.' });
    }

    const hashedPath = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1, ' +
        'activation_token = null WHERE activation_token = $2',
      [hashedPath, token],
    );

    res.json({
      message: 'Password has been reset successfully! You can now log in.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateName = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    await pool.query('UPDATE users SET name = $1 WHERE id = $2', [
      name,
      userId,
    ]);
    res.json({ message: 'Name updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmation } = req.body;
  const userId = req.user.id;

  if (newPassword !== confirmation) {
    return res.status(400).json({ message: 'New passwords do not match.' });
  }

  try {
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId],
    );
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect.' });
    }

    const hashedPath = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      hashedPath,
      userId,
    ]);

    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateEmail = async (req, res) => {
  const { newEmail, password } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT email, password_hash FROM users WHERE id = $1',
      [userId],
    );
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    const activationToken = uuidv4();

    await pool.query(
      'UPDATE users SET email = $1, ' +
        'is_activated = false, activation_token = $2 WHERE id = $3',
      [newEmail, activationToken, userId],
    );

    const link = `http://localhost:3000/api/activate/${activationToken}`;

    await sendActivationMail(newEmail, link);

    res.json({
      message: 'Email updated! Please check your new email to activate it.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};
