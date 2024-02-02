import { ApiError } from "../exeptions/api.error.js";
import { jwtService } from "../services/jwt.service.js";
import { tokenService } from "../services/token.service.js";
import { usersService } from "../services/user.service.js";
import bcrypt from "bcrypt";
import { emailService } from "../services/email.service.js";
import { v4 as uuidv4 } from "uuid";
import { validateEmail, validatePassword } from "../utils/validation.js";

const getAllActivated = async (req, res) => {
  const users = await usersService.getAllActivated();

  res.send(users.map(usersService.normalize));
}

const changeName = async (req, res) => {
  const { refreshToken } = req.cookies;
  const { newName } = req.body;

  if (!newName){
    throw ApiError.badRequest('You did not enter new name')
  }

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  const user = await usersService.findByEmail(userData.email);

  user.name = newName;
  user.save();

  res.send({ message: 'Name updated' });
}

const changePassword = async (req, res) => {
  const { refreshToken } = req.cookies;
  const { oldPassword, newPassword } = req.body;

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  const user = await usersService.findByEmail(userData.email);

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.save();

  await tokenService.remove(userData.id);
  res.send({ message: 'Password updated, please login with new password' });
};

async function changeEmail(req, res) {
  const { refreshToken } = req.cookies;
  const { password, newEmail } = req.body;

  const userData = await jwtService.verifyRefresh(refreshToken);

  console.log(userData);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  const user = await usersService.findByEmail(userData.email);

  const oldEmail = user.email;

  const errors = {
    password: validatePassword(password),
    newEmail: validateEmail(newEmail),
  };

  if (oldEmail === newEmail) {
    throw ApiError.BadRequest('New email must be different from old email');
  }

  if (errors.password || errors.newEmail) {
    throw ApiError.BadRequest('Validation error', errors);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.BadRequest('Wrong password');
  }

  const activationToken = uuidv4();

  user.email = newEmail;
  user.activationToken = activationToken;
  user.save();

  await emailService.sendActivationEmail(newEmail, activationToken);
  await emailService.sendNewEmail(oldEmail, newEmail);

  res.send(usersService.normalize(user));
}

export const userController = {
  getAllActivated,
  changeName,
  changePassword,
  changeEmail
};
