'use strict';

import { sequelize } from '../db.js';
import { emailService } from '../services/emailService.js';
import { userService } from '../services/userService.js';
import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt';
// import crypto from 'crypto';
import { Op } from 'sequelize';
import { jwtService } from '../services/jwtService.js';
import { tokenService } from '../services/tokenService.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAll();

    res.status(200).json(users);
  } catch (error) {
    // console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user && user.activationToken !== null) {
      return res.status(404).json({ message: 'User is not activated' });
    }

    res.status(200).json(user);
  } catch (error) {
    // console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }

    // console.log('AAAA');
    const user = await userService.getByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'This email is not registered' });
    }

    if (user.activated === false) {
      return res
        .status(403)
        .json({ message: 'Check your email to activate your account' });
    }

    // console.log('AAAAlllllllllllll');
    // TEMP (plain text)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong password' });
    }
    // console.log('--------');
    generateTokens(res, user);
    // const normalizedUser = userService.normalize(user);
    // const accessToken = jwtService.sign(normalizedUser);

    // res.status(200).json({
    //   user: normalizedUser,
    //   accessToken
    // });
  } catch (error) {
    // console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to connect to the server' });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'You have to log in' });
    }

    const userData = jwtService.verifyRefresh(refreshToken);
    const tokenFromDb = await tokenService.getByToken(refreshToken);

    if (!userData || !tokenFromDb) {
      return res.status(401).json({ message: 'You have to log in' });
    }

    const user = await userService.getByEmail(userData.email);

    return generateTokens(res, user);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// export const refresh = async (req, res) => {
//   const refreshToken = req.cookies.refreshToken;

//   const userData = jwtService.verifyRefresh(refreshToken);
//   const token = await tokenService.getByToken(refreshToken);
//   if (!userData || !token) {
//     return res.status(401).json({ message: 'You have to log in' });
//   }

//   const user = await userService.getByEmail(user.email);
//   generateTokens(res, user);
// }

export const generateTokens = async (res, user) => {
  // console.log('/////////');
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false, // true in prod
    sameSite: 'lax',
    // path: '/users/refresh',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false, // true in prod
    sameSite: 'strict',
    // path: '/users/refresh',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    user: normalizedUser,
    accessToken,
  });
};

export const getUserByActivationToken = async (req, res) => {
  try {
    const { activationToken } = req.params;
    const user = await userService.getByActivationToken(activationToken);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user && user.activationToken !== null) {
      return res.status(404).json({ message: 'User is not activated' });
    }

    res.status(200).json(user);
  } catch (error) {
    // console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields must be filled in ' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Your password is too short ' });
  }

  const transaction = await sequelize.transaction();

  try {
    // 1️⃣ Hash password ONCE
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2️⃣ Create user with HASHED password
    const newUser = await userService.create(
      {
        name,
        email,
        password: hashedPassword,
      },
      transaction,
    );

    // 3️⃣ Commit DB transaction
    await transaction.commit();

    // 4️⃣ Send activation email (outside transaction)
    try {
      await emailService.sendActivationEmail(email, newUser.activationToken);
    } catch (emailError) {
      // console.error('Activation email failed:', emailError);
      // user is still created — this is OK
    }

    // 5️⃣ Safe response (NEVER send password)
    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      message: 'Check your email to activate your account',
    });
  } catch (error) {
    await transaction.rollback();
    // console.error(error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res
        .status(409)
        .json({ message: 'This email is already registered' });
    }

    return res
      .status(500)
      .json({ message: 'Failed to create a user. Server problem.' });
  }
};

// export const updateUserActivated = async (req, res) => {
//   const { activationToken } = req.params;

//   const user = await User.findOne({
//     where: { activationToken },
//   });

//   if (!user) {
//     return res.status(400).json({ message: 'Invalid or expired token' });
//   }

//   user.activated = true;
//   user.activationToken = null;

//   await user.save();

//   res.json({ userId: user.id });
// };

export const updateUserActivated = async (req, res) => {
  try {
    const { activationToken } = req.params;

    const user = await User.findOne({ where: { activationToken } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (user.activated) {
      return res.status(400).json({ message: 'Account already activated' });
    }

    user.activated = true;
    user.activationToken = null;
    await user.save();

    return generateTokens(res, user);
  } catch (err) {
    // console.error(err);

    return res.status(500).json({ message: 'mistake in controller' });
  }
};

// export const updateUserActivated = async (req, res) => {
//   const { activationToken } = req.params;

//   const user = await User.findOne({
//     where: { activationToken },
//   });

//   if (!user) {
//     return res.status(400).json({ message: 'Invalid or expired token' });
//   }

//   // ✅ activate user
//   user.activated = true;
//   user.activationToken = null;
//   await user.save();

//   // // ✅ CREATE JWT *AFTER* activation
//   // const accessToken = jwtService.sign({
//   //   id: user.id,
//   //   email: user.email,
//   // });

//   return generateTokens(res, user);

//   // ✅ send token to frontend
//   // return res.json({
//   //   message: 'Account activated successfully',
//   //   accessToken,
//   //   userId: user.id,
//   // });
// };

export const resetPassword = async (req, res) => {
  try {
    const { resetEmail } = req.body;

    const user = await User.findOne({
      where: { email: resetEmail },
    });

    if (!user) {
      return res.status(404).json({ message: 'This email is not registered' });
    }

    // 1️⃣ Generate raw token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2️⃣ Hash token before saving
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 3️⃣ Save hashed token + expiry
    user.resetToken = hashedResetToken;
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();

    // 4️⃣ Send RAW token via email
    await emailService.sendResetPasswordEmail(resetEmail, resetToken);

    return res.status(200).json({
      message: 'Password reset link sent',
    });
  } catch (error) {
    // console.error(error);

    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const resetUserPassword = async (req, res) => {
  const { newPassword } = req.body;
  const { resetToken } = req.params;

  // 1️⃣ Hash the token from URL (we stored hashed in DB)
  const hashedResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 2️⃣ Find the user with valid token and not expired
  const user = await User.findOne({
    where: {
      resetToken: hashedResetToken,
      resetTokenExpires: {
        [Op.gt]: new Date(),
      },
    },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  // 3️⃣ Hash new password before saving
  user.password = await bcrypt.hash(newPassword.trim(), 10);

  // 4️⃣ Invalidate the token
  user.resetToken = null;
  user.resetTokenExpires = null;

  await user.save();

  res.json({ message: 'Password reset successfully', userId: user.id });
};

export const changeUserName = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const user = await User.findOne({
    where: { id },
  });

  // console.log(`New name:{name}`);

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Name is required' });
  }

  // const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.name = name.trim();
  await user.save();

  return res.status(200).json({
    message: 'Name updated successfully',
    user: {
      // id: user.id,
      name: user.name,
    },
  });
};

// import { User } from '../models/User.js'; // adjust path

export const changeUserPassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  const user = await User.findOne({ where: { id } });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!oldPassword || oldPassword.trim() === '') {
    return res.status(400).json({ message: 'Old password is required' });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Old password is wrong' });
  }

  if (!newPassword || newPassword.trim() === '') {
    return res.status(400).json({ message: 'New password is required' });
  }

  user.password = await bcrypt.hash(newPassword.trim(), 10);
  await user.save();

  return res.status(200).json({ message: 'Password updated successfully' });
};

export const changeUserEmail = async (req, res) => {
  const { id } = req.params;
  const { password, newEmail } = req.body;

  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!password || !password.trim()) {
    return res.status(400).json({ message: 'Password is required' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: 'Password is incorrect' });
  }

  if (!newEmail || !newEmail.trim()) {
    return res.status(400).json({ message: 'New email is required' });
  }

  // ✅ check if email already exists
  const emailExists = await User.findOne({
    where: { email: newEmail.trim() },
  });

  if (emailExists) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const oldEmail = user.email;

  user.email = newEmail.trim();
  await user.save();

  // ✅ notify OLD email for security
  await emailService.sendEmailChanged(oldEmail, newEmail.trim());

  return res.status(200).json({ message: 'Email updated successfully' });
};

export const logout = async (req, res) => {
  // console.log('ssssssssssssssssss');

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  const userData = jwtService.verifyRefresh(refreshToken);
  const tokenFromDb = await tokenService.getByToken(refreshToken);

  if (!userData || !tokenFromDb) {
    return res.status(401).json({ message: 'You have to log in' });
  }

  await tokenService.remove(userData.id);
  res.clearCookie('refreshToken');

  res.sendStatus(204);
};

// export const logout = async (req, res) => {
//   console.log('ssssssssssssssssss');
//   try {
//     const refreshToken = req.cookies?.refreshToken;

//     // No cookie → already logged out
//     if (!refreshToken) {
//       return res.sendStatus(204);
//     }

//     // Remove token from DB
//     await tokenService.removeByToken(refreshToken);

//     // Clear cookie (PATH MUST MATCH!)
//     res.clearCookie('refreshToken', {
//       httpOnly: true,
//       path: '/users/refresh',
//     });

//     return res.sendStatus(204);
//   } catch (err) {
//     console.error('Logout error:', err);
//     return res.sendStatus(500);
//   }
// };

export default {
  getAllUsers,
  getUserById,
  getUserByActivationToken,
  createUser,
  updateUserActivated,
  changeUserName,
  changeUserPassword,
  changeUserEmail,
  resetUserPassword,
  refresh,
  logout,
};
