'use strict';

const bcrypt = require('bcrypt');
const { usersRepository } = require('../entity/users.repository');
const { sendEmail } = require('../utils/email');
const {
  PASSWORD_RULES_MESSAGE,
  isPasswordValid,
} = require('../utils/password');

async function getProfile(req, res) {
  try {
    const user = await usersRepository.getById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      message: 'Profile is available',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    process.stderr.write(`${error}\n`);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function updateName(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: 'Name is required',
      });
    }

    const user = await usersRepository.updateName(req.user.userId, name);

    return res.status(200).json({
      message: 'Name updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    process.stderr.write(`${error}\n`);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function updatePassword(req, res) {
  try {
    const { oldPassword, newPassword, confirmation } = req.body;

    if (!oldPassword || !newPassword || !confirmation) {
      return res.status(400).json({
        message: 'Old password, new password and confirmation are required',
      });
    }

    if (newPassword !== confirmation) {
      return res.status(400).json({
        message: 'Password confirmation must match password',
      });
    }

    if (!isPasswordValid(newPassword)) {
      return res.status(400).json({
        message: PASSWORD_RULES_MESSAGE,
      });
    }

    const user = await usersRepository.getById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      return res.status(400).json({
        message: 'Old password is incorrect',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await usersRepository.updatePassword(user.id, hashedPassword);

    return res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    process.stderr.write(`${error}\n`);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

async function updateEmail(req, res) {
  try {
    const { password, newEmail, confirmEmail } = req.body;

    if (!password || !newEmail || !confirmEmail) {
      return res.status(400).json({
        message: 'Password, newEmail and confirmEmail are required',
      });
    }

    if (newEmail !== confirmEmail) {
      return res.status(400).json({
        message: 'Email confirmation must match new email',
      });
    }

    const user = await usersRepository.getById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const existingUser = await usersRepository.getByEmail(newEmail);

    if (existingUser && existingUser.id !== user.id) {
      return res.status(400).json({
        message: 'Email already exists',
      });
    }

    const isPasswordValidForUser = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordValidForUser) {
      return res.status(400).json({
        message: 'Password is incorrect',
      });
    }

    await sendEmail({
      to: user.email,
      subject: 'Your email has been changed',
      text: `Your Auth App email has been changed from ${user.email} to ${newEmail}.`,
    });

    const updatedUser = await usersRepository.updateEmail(user.id, newEmail);

    return res.status(200).json({
      message: 'Email updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    process.stderr.write(`${error}\n`);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

module.exports = {
  profileController: {
    getProfile,
    updateName,
    updatePassword,
    updateEmail,
  },
};
