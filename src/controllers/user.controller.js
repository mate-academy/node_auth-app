const { ApiError } = require('../exeptions/api.error.js');
const { jwtService } = require('../services/jwt.service.js');
const { userService } = require('../services/user.service.js');
const { validate } = require('../services/validate.service.js');
const bcrypt = require('bcrypt');

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

const getProfile = async (req, res) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!token) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findById(userData.id);

  res.send({
    username: user.username,
    email: user.email,
  });
};

const updateProfile = async (req, res) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!token) {
    throw ApiError.unauthorized();
  }

  const userData = jwtService.verify(token);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const { userId, username, email, password, currentPassword } = req.body;

  if (!userId) {
    throw ApiError.badRequest('User ID is required');
  }

  const user = await userService.findById(userId);

  const errors = {};

  if (username) {
    const usernameError = validate.validateUsername(username);

    if (usernameError) {
      errors.username = usernameError;
    }
  }

  if (email) {
    if (!currentPassword) {
      errors.currentPassword = 'Current password is required to change email';
    } else {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        errors.currentPassword = 'Current passwrod is incorrect';
      }
    }

    const emailError = validate.validateEmail(email);

    if (emailError) {
      errors.email = emailError;
    }
  }

  let hashedPassword;

  if (password) {
    if (!currentPassword) {
      errors.currentPassword =
        'Current password is required to change password';
    } else {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        errors.currentPassword = 'Current password is incorrect';
      }
    }

    const passwordError = validate.validatePassword(password);

    if (passwordError) {
      errors.password = passwordError;
    }

    hashedPassword = await bcrypt.hash(password, 10);
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const updatedUser = await userService.updateProfile(userData.id, {
    username,
    email,
    password: hashedPassword,
  });

  res.status(200);

  res.send({
    username: updatedUser.username,
    email: updatedUser.email,
  });
};

exports.userController = {
  getAllActivated,
  updateProfile,
  getProfile,
};
