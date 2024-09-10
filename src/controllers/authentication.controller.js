const { Sequelize } = require('sequelize');
const usersService = require('../services/users.service.js');
const emailService = require('../services/emails.service.js');
const tokenService = require('../services/token.service.js');
const jwtService = require('../services/jwt.service.js');
const ApiError = require('../exeptions/api.error.js');
const bcrypt = require('bcrypt');

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    if (!name) {
      throw ApiError.BadRequest('Bad request', 'Name is required');
    }

    if (!email) {
      throw ApiError.BadRequest('Bad request', 'Email is required');
    }

    if (!password) {
      throw ApiError.BadRequest('Bad request', 'Password is required');
    }

    const hashedPass = await bcrypt.hash(password, 10);

    await usersService.createUser(name, email, hashedPass);

    res.send({ message: 'OK' });
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      const errorMessages = {};

      error.errors.forEach((err) => {
        if (err.path === 'email') {
          errorMessages.email = 'Email is not valid';
        } else if (err.path === 'password') {
          errorMessages.password = 'At least 6 characters';
        }
      });

      return next(ApiError.BadRequest('Validation Error', errorMessages));
    }

    if (error instanceof Sequelize.UniqueConstraintError) {
      const errorMessages = {};

      error.errors.forEach((err) => {
        if (err.path === 'email') {
          errorMessages.email = 'User already exist';
        }
      });

      return next(
        ApiError.BadRequest('Unique Constraint Error', errorMessages),
      );
    }
  }
};

const activate = async (req, res, next) => {
  try {
    const { activationToken } = req.params;
    const user = await usersService.getOneBy(activationToken);

    if (!user) {
      res.sendStatus(404);

      return;
    }

    user.activationToken = null;
    await user.save();

    const normalizedUser = usersService.normalize(user);
    const accessToken = jwtService.sign(normalizedUser);
    const refreshToken = jwtService.signRefresh(normalizedUser);

    await tokenService.save(normalizedUser.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    res.send({
      user: normalizedUser,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await usersService.getOneBy(email);

    if (!user) {
      throw ApiError.BadRequest('No such user');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.BadRequest('Wrong password');
    }

    if (user.activationToken) {
      throw ApiError.BadRequest(
        'Account not activated. Please check your email.',
      );
    }

    await generateTokens(res, user);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw ApiError.Unauthorized('No refresh token found');
    }

    const userData = jwtService.verifyRefresh(refreshToken);

    if (!userData) {
      throw ApiError.Unauthorized('Invalid refresh token');
    }

    const user = await usersService.getOneBy(userData.email);
    const newAccessToken = jwtService.sign(user);

    res.send({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const userData = jwtService.verifyRefresh(refreshToken);

    if (!userData || !refreshToken) {
      throw ApiError.Unauthorized();
    }

    await tokenService.remove(userData.id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

const generateTokens = async (res, user) => {
  const normalizedUser = usersService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser);
  const refreshToken = jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const sendResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await usersService.getOneBy(email);

    if (!user) {
      throw ApiError.BadRequest('No such user');
    }

    const resetToken = jwtService.signResetToken({ id: user.id });

    await emailService.sendEmail(
      email,
      resetToken,
      'password-reset-confirm',
      'Reset Password',
      'Reset Password',
    );

    res.send({ message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    const { password, confirmation } = req.body;

    if (password !== confirmation) {
      throw ApiError.BadRequest('Passwords do not match');
    }

    const userData = jwtService.verify(resetToken);

    if (!userData) {
      throw ApiError.Unauthorized('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersService.resetUserPassword(userData.id, hashedPassword);

    res.send({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  activate,
  login,
  refresh,
  logout,
  sendResetEmail,
  resetPassword,
};
