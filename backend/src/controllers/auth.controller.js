const { User } = require('../model/user');
const { userService } = require('../services/user.service');
const { jwtService } = require('../services/jwt.service');
const { ApiError } = require('../exception/api.error');
const bcrypt = require('bcrypt');
const { tokenService } = require('../services/token.service');
const { bcryptService } = require('../services/bcrypt.service');

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

const validUserName = (value) => {
  const namePattern = /^[A-Za-zА-Яа-яЁёІіЇїЄєҐґ\s'-]{2,50}$/;

  if (!value) {
    return 'Name is required';
  }

  if (!namePattern.test(value)) {
    return "Use letters, spaces, ' or -, min 2 chars";
  }
};

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

const generateTokens = async (res, user) => {
  const normalizedUser = userService.normalize(user);
  const accessToken = jwtService.sign(normalizedUser, process.env.JWT_KEY);
  const refreshToken = jwtService.signRefresh(
    normalizedUser,
    process.env.JWT_REFRESH_KEY,
  );

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'None',
    secure: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const registration = async (req, res) => {
  const { email, password, userName } = req.body;

  const errors = {
    email: validateEmail(email),
    name: validUserName(userName),
    password: validatePassword(password),
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashPass = await bcrypt.hash(password, 10);

  await userService.register(email, hashPass, userName);

  res.send({
    message: 'OK',
  });
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.sendStatus(404);

    return;
  }

  user.activationToken = null;
  user.save();

  generateTokens(res, userService.normalize(user));

  // res.send(userService.normalize(user));
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw ApiError.badRequest('Incorrect email or password');
  }

  const isValidPass = await bcrypt.compare(password, user.password);

  if (!isValidPass) {
    throw ApiError.badRequest('Incorrect email or password');
  }

  if (user.activationToken) {
    throw ApiError.badRequest(
      // eslint-disable-next-line max-len
      'Your account is not activated. Please check your email and follow the activation link to complete registration.',
    );
  }

  generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userDate = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userDate || !token) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findByEmail(userDate.email);

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  const userDate = await jwtService.verifyRefresh(refreshToken);

  if (!userDate || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userDate.id);

  res.sendStatus(204);
};

const sendPassResetLink = async (req, res) => {
  const { email } = req.body;

  const errors = {
    email: validateEmail(email),
  };

  if (errors.email) {
    throw ApiError.badRequest('Incorrect email', errors);
  }

  await userService.reset(email);

  res.send({
    message:
      'If an account with this email exists, a reset link has been sent.',
  });
};

const resetPassword = async (req, res) => {
  const { resetToken, password, confirmation } = req.body;
  const errors = {
    password: validatePassword(password),
  };

  if (!confirmation) {
    errors.confirmation = 'Password confirmation is required.';
  }

  if (confirmation && confirmation !== password) {
    errors.confirmation = 'Passwords do not match.';
  }

  if (errors.password || errors.confirmation) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const hashPass = await bcryptService.hashPassword(password);

  await userService.resetPassword({ resetToken, password: hashPass });

  return res.status(200).send('Password updated');
};

const authController = {
  registration,
  activate,
  login,
  refresh,
  logout,
  sendPassResetLink,
  resetPassword,
  generateTokens,
};

module.exports = { authController };
