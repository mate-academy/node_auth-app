import { usersService } from "../services/users.service.js";
import {jwtService} from "../services/jwt.service.js";
import {ApiError} from "../exeptions/api.error.js";
import {validateUtils} from "../utils/validation.js";
import {authService} from "../services/auth.service.js";
import bcrypt from "bcrypt";

const getAllActivated = async (req, res) => {
  const activatedUsers = await usersService.getAllActivated();

  res.send(activatedUsers.map(usersService.normalize));
};

const changeEmail = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const { newEmail, password } = req.body;

  if (!newEmail || !password || validateUtils.validateEmail(newEmail)) {
    throw ApiError.badRequest('Bad params to change email');
  }

  const user = await authService.getOneUserByEmail(userData.email);

  if (!user) {
    throw ApiError.notFound();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Bad password');
  }

  await usersService.updateEmail(user.id, newEmail);

  res.clearCookie('refreshToken');
  return res.status(200).send({ message: 'Email updated, confirm your new email' });
};

const changePassword = async(req, res) => {
  const { refreshToken } = req.cookies;

  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const { oldPassword, newPassword } = req.body;

  const user = await authService.getOneUserByEmail(userData.email);

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Bad password');
  }

  console.log(user.id);

  await usersService.changePassword(user.id, newPassword);

  res.clearCookie('refreshToken');
  res.send({ message: 'Password updated, login please' });
};

export const usersController = {
  getAllActivated, changeEmail, changePassword,
};
