import { ApiError } from '../exeptions/api.error.js';
import { userService } from '../services/user.service.js';
import { validate } from '../services/validate.service.js';

const getAllActivated = async (req, res) => {
  const users = await userService.getAllActivated();

  res.send(users.map(userService.normalize));
};

const getProfile = async (req, res) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!token) throw ApiError.unauthorized();

  const userData = jwtService.verify(token);
  if (!userData) throw ApiError.unauthorized();

  const user = await userService.findById(userData.id);
  res.send({
    username: user.username,
    email: user.email,
  });
};

const updateProfile = async (req, res) => {
  const authorization = req.headers['authorization'] || '';
  const [, token] = authorization.split(' ');

  if (!token) throw ApiError.unauthorized();

  const userData = jwtService.verify(token);
  if (!userData) throw ApiError.unauthorized();

  const { username, email } = req.body;

  const errors = {};

  if (username) {
    const usernameError = validate.validateUsername(username);
    if (usernameError) errors.username = usernameError;
  }
  if (email) {
    const emailError = validate.validateEmail(email);
    if (emailError) errors.email = emailError;
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest('Bad request', errors);
  }

  const updatedUser = await userService.updateProfile(userData.id, {
    username,
    email,
  });

  res.status(200);
  res.send({
    username: updatedUser.username,
    email: updatedUser.email,
  });
};

export const userController = {
  getAllActivated,
  getProfile,
  updateProfile
};
