const bcrypt = require('bcrypt');
const userService = require('../services/user.service');
const jwtService = require('../services/jwt.service');
const ApiError = require('../exeptions/api.error');
const tokenService = require('../services/token.service');
const emailService = require('../services/email.service');

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const errors = {
      name: !name ? 'Name is required' : null,
      email: validateEmail(email),
      password: validatePassword(password),
    };

    if (errors.name || errors.email || errors.password) {
      throw ApiError.BadRequest('Bad request', errors);
    }

    const hashedPass = await bcrypt.hash(password, 10);

    await userService.register(name, email, hashedPass);

    res.send({ message: 'OK' });
  } catch (error) {
    next(error);
  }
};

const activate = async (req, res, next) => {
  try {
    const { activationToken } = req.params;
    const user = await userService.findByActivationToken(activationToken);

    if (!user) {
      res.sendStatus(404);

      return;
    }

    user.activationToken = null;
    await user.save();

    const normalizedUser = userService.normalize(user);
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

    const user = await userService.findByEmail(email);

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

    const user = await userService.findByEmail(userData.email);
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
  const normalizedUser = userService.normalize(user);
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
    const user = await userService.findByEmail(email);

    if (!user) {
      throw ApiError.BadRequest('No such user');
    }

    const resetToken = jwtService.signResetToken({ id: user.id });

    await emailService.sendResetEmail(email, resetToken);

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

    await userService.resetPassword(userData.id, hashedPassword);

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
