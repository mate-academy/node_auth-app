import { ApiError } from "../exceptions/api.error.js";
import { User } from "../models/user.js";
import { emailService } from "../services/email.service.js";
import { jwtService } from "../services/jwt.service.js";
import { userService } from "../services/user.service.js";
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { tokenService } from "../services/token.service.js";


async function validatePassword(password, passwordInDatabase) {
  const isPasswordValid = await bcrypt.compare(password, passwordInDatabase);
  if (!isPasswordValid) {
    return 'Entered old password is wrong!';
  }
}

const getAll = async (req, res) => {
  const users = await User.findAll()

  res.status(200).send(users.map(userService.normalize));
}

const getMe = async (req, res) => {
  const authorization = req.headers['authorization'] || '';
  const [_, token] = authorization.split(' ');
  const userData = jwtService.verify(token);

  if (!userData) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findById(userData.id);

  res.status(200).send(userService.normalize(user));
}

const updateUser = async (req, res) => {
  const userBody = req.body;
  const authorization = req.headers['authorization'] || '';
  const [_, token] = authorization.split(' ');
  const userData = jwtService.verify(token);
  if (!userData) {
    throw ApiError.unauthorized();
  }

  const user = await userService.findById(userData.id);
  if (!user) {
    throw ApiError.notFound({ user: `user is not found`});
  }

  const updatedUser = { ...user.dataValues, ...userBody };

  await user.update(updatedUser);

  res.status(200).send(userService.normalize(updatedUser));
}

const updateUserEmail = async (req, res) => {
  const { email, password } = req.body;
  const authorization = req.headers['authorization'] || '';
  const [_, token] = authorization.split(' ');
  const userData = jwtService.verify(token);
  if (!userData) {
    throw ApiError.unauthorized();
  }


  const user = await userService.findById(userData.id);
  if (!user) {
    throw ApiError.notFound({ user: `user is not found`});
  }
  const invalidPass = await validatePassword(password, user.password);
  if (invalidPass) {
    throw ApiError.badRequest('Wrong password');
  }

  const isExist = await userService.findByEmail(email);
  if (isExist) {
     throw ApiError.badRequest('Email already in use');
  }
  const emailChangeToken = uuidv4();

  user.pendingEmail = email;
  user.emailChangeToken = emailChangeToken;

  await user.save();
  await emailService.sendChangeEmailNotification(user.email, email);
  await emailService.sendChangeEmailActivation(email, emailChangeToken);

  res.status(200).send('Ok');
}

const activateEmailChange = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { emailChangeToken: activationToken } })

  if (!user) {
    throw ApiError.notFound({ token: 'token not found' })
  }

  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.emailChangeToken = null;
  await user.save();

  await tokenService.remove(user.id);

  res.send(userService.normalize(user));
}


export const userController = {
  getAll,
  updateUser,
  getMe,
  updateUserEmail,
  activateEmailChange
}