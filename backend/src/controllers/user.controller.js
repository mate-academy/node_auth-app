const { ApiError } = require('../exception/api.error');
const { User } = require('../model/user');
const { bcryptService } = require('../services/bcrypt.service');
const { emailService } = require('../services/email.service');
const { jwtService } = require('../services/jwt.service');
const { tokenService } = require('../services/token.service');
const { userService } = require('../services/user.service');
const { authController } = require('./auth.controller');

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

const checkAuth = async (refreshToken) => {
  const userData = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!userData || !token) {
    throw ApiError.unauthorized();
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);

  res.send(userService.normalize(user));
};

const changePassword = async (req, res) => {
  const { oldPassword, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw ApiError.badRequest('Passwords do not match', {
      password: 'Passwords do not match',
    });
  }

  const { refreshToken } = req.cookies;
  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  const user = await User.findOne({ where: { email: userData.email } });
  const isValidPassword = await bcryptService.isValidPass(
    oldPassword,
    user.password,
  );

  if (!isValidPassword) {
    throw ApiError.badRequest('Incorrect current password', {
      message: 'Incorrect current password',
    });
  }

  const hashPass = await bcryptService.hashPassword(password);

  user.password = hashPass;
  await user.save();

  res.send({
    message: 'Password has been successfully updated!',
  });
};

const changeName = async (req, res) => {
  const { userId } = req.params;
  const { userName } = req.body;
  const { refreshToken } = req.cookies;

  const errors = { userName: validUserName(userName) };

  await checkAuth(refreshToken);

  const user = await userService.getUserById(userId);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  if (errors.userName) {
    throw ApiError.badRequest('Bad request', errors);
  }

  user.userName = userName;
  await user.save();

  res.send(userService.normalize(user));
};

const changeEmail = async (req, res) => {
  const { userId } = req.params;
  const { email, confirmEmail, password } = req.body;
  const { refreshToken } = req.cookies;

  await checkAuth(refreshToken);

  const errors = {
    email: validateEmail(email),
    password: password ? null : 'Password is required!',
  };

  if (!confirmEmail) {
    errors.confirmEmail = 'Email confirmation is required.';
  }

  if (confirmEmail !== email) {
    errors.confirmEmail = 'Emails do not match.';
  }

  if (errors.email || errors.password || errors.confirmEmail) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const user = await userService.getUserById(userId);

  if (!user) {
    throw ApiError.badRequest('User not found');
  }

  const isValidPassword = await bcryptService.isValidPass(
    password,
    user.password,
  );

  if (!isValidPassword) {
    throw ApiError.badRequest('Incorrect password', {
      message: 'Incorrect password',
    });
  }

  const oldEmail = user.email;

  user.email = email;
  await user.save();

  await emailService.sendAfterChangeEmail(oldEmail, user.email);
  await tokenService.remove(userId);
  await authController.generateTokens(res, user);
};

const userController = {
  getUserById,
  changePassword,
  changeName,
  changeEmail,
};

module.exports = { userController };
