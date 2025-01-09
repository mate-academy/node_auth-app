// import { User } from '../models/user.js';
// import { userService } from '../services/user.services.js';
// import { jwtService } from '../services/jwt.service.js';
// import { ApiError } from '../exeptions/api.error.js';
// import bcrypt from 'bcrypt';
// import { tokenService } from '../services/token.service.js';

// function validateEmail(value) {
//   if (!value) {
//     return 'Email is required';
//   }

//   const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

//   if (!emailPattern.test(value)) {
//     return 'Email is not valid';
//   }
// }

// function validatePassword(value) {
//   if (!value) {
//     return 'Password is required';
//   }

//   if (value.length < 6) {
//     return 'At least 6 characters';
//   }
// }

// const register = async (req, res) => {
//   const { email, password } = req.body;
//   const errors = {
//     email: validateEmail(email),
//     password: validatePassword(password),
//   };

//   if (errors.email || errors.password) {
//     throw ApiError.badRequest('Bad request', errors);
//   }

//   const hashedPass = await bcrypt.hash(password, 10);

//   await userService.register(email, hashedPass);
//   res.send({ message: 'OK' });
// };

// const activate = async (req, res) => {
//   const { activationToken } = req.params;
//   const user = await User.findOne({ where: { activationToken } });

//   if (!user) {
//     res.sendStatus(404);

//     return;
//   }
//   user.activationToken = null;
//   user.save();

//   res.send(user);
// };

// const login = async (req, res) => {
//   const { email, password } = req.body;

//   const user = await userService.findByEmail(email);

//   if (!user) {
//     throw ApiError.badRequest('No such user');
//   }

//   const isPasswordValid = await bcrypt.compare(password, user.password);

//   if (!isPasswordValid) {
//     throw ApiError.badRequest('Wrong password');
//   }

//   await generateTokens(res, user);
// };

// const refresh = async (req, res) => {
//   const { refreshToken } = req.cookies;

//   if (!refreshToken) {
//     throw new Error('Error');
//   }

//   const userData = await jwtService.verifyRefresh(refreshToken);
//   const token = await tokenService.getByToken(refreshToken);

//   if (!userData || !token) {
//     throw ApiError.unauthorized();
//   }

//   // const user = await userService.getUserByEmail(userData.email);
//   const user = await userService.findByEmail(userData.email);

//   await generateTokens(res, user);
// };

// const generateTokens = async (res, user) => {
//   const normalizedUser = userService.normalize(user);

//   const accessToken = jwtService.sign(normalizedUser);
//   const refreshAccessToken = jwtService.signRefresh(normalizedUser);

//   await tokenService.save(normalizedUser.id, refreshAccessToken);

//   res.cookie('refreshToken', refreshAccessToken, {
//     maxAge: 30 * 24 * 60 * 60 * 1000,
//     HttpOnly: true,
//   });

//   res.send({
//     user: normalizedUser,
//     accessToken,
//   });
// };

// const logout = async (req, res) => {
//   const { refreshToken } = req.cookies;
//   const userData = await jwtService.verifyRefresh(refreshToken);

//   if (!userData || !refreshToken) {
//     throw ApiError.unauthorized();
//   }

//   await tokenService.remove(userData.id);
//   res.sendStatus(204);
// };

// export const authController = {
//   register,
//   activate,
//   login,
//   refresh,
//   logout,
// };

import { User } from '../models/user.js';
import { userService } from '../services/user.services.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exeptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';

function validateEmail(value) {
  if (!value) {
    throw ApiError.badRequest('Email is required');
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    throw ApiError.badRequest('Email is not valid');
  }
}

function validatePassword(value) {
  if (!value) {
    throw ApiError.badRequest('Password is required');
  }

  if (value.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters long');
  }
}

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!name) {
      throw ApiError.badRequest('Name is required');
    }

    validateEmail(email);
    validatePassword(password);

    const hashedPass = await bcrypt.hash(password, 10);

    await userService.register(email, hashedPass, name);
    res.send({ message: 'Registration successful' });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const activate = async (req, res) => {
  try {
    const { activationToken } = req.params;
    const user = await User.findOne({ where: { activationToken } });

    if (!user) {
      res.status(404).send({ message: 'Activation token not found' });

      return;
    }

    user.activationToken = null;
    await user.save();

    res.send({ message: 'Account activated successfully', user });
  } catch (error) {
    res.status(500).send({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.findByEmail(email);

    if (!user) {
      throw ApiError.badRequest('No such user');
    }

    if (!user.activationToken === null) {
      throw ApiError.badRequest('User account is not activated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.badRequest('Wrong password');
    }

    await generateTokens(res, user);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw ApiError.unauthorized();
    }

    const userData = await jwtService.verifyRefresh(refreshToken);

    const token = await tokenService.getByToken(refreshToken);

    if (!userData || !token) {
      throw ApiError.unauthorized();
    }

    const user = await userService.findByEmail(userData.email);

    await generateTokens(res, user);
  } catch (error) {
    res.status(401).send({ message: error.message });
  }
};

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);

  const accessToken = jwtService.sign(normalizedUser, { expiresIn: '15m' });
  const refreshAccessToken = jwtService.signRefresh(normalizedUser, {
    expiresIn: '30d',
  });

  await tokenService.save(normalizedUser.id, refreshAccessToken);

  res.cookie('refreshToken', refreshAccessToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const userData = await jwtService.verifyRefresh(refreshToken);

    if (!userData || !refreshToken) {
      throw ApiError.unauthorized();
    }

    await tokenService.remove(userData.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(401).send({ message: error.message });
  }
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
};
