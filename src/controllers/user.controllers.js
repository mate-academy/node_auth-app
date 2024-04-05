import { userService } from '../services/user.service.js'
import { emailService } from '../services/email.service.js';
import { ApiError } from '../exeptions/ApiError.js';
import { v4 as uuidv4 } from "uuid";
import cookie from 'cookie';
import bcrypt from 'bcrypt';
import { isEmailInvalid, isPasswordInvalid } from '../utils/functions.js';

export const loadAllActivated = async (req, res) => {
  const allUsers = await userService.getAllActivated();

  res.send(allUsers.map(userService.normalize));
};

export const verifyPassword = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.NotFound('It seams your email was changed');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw ApiError.BadRequest('Wrong password');
  }

  res.send(userService.normalize(user));
};

export const rename = async (req, res) => {
  const { email, name } = req.body;
  
  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.NotFound('It seams your email was changed');
  }

  if (user.name === name) {
    throw ApiError.Conflict('You already use this name');
  }

  user.name = name;
  await user.save();

  res.send(userService.normalize(user));
};

export const verifyEmail = async (req, res) => {
  const { newEmail } = req.body;
  const resetToken = uuidv4();
  const emailError = isEmailInvalid(newEmail);

  if (emailError) {
    throw ApiError.BadRequest(emailError);
  }

  const user = await userService.getByEmail(newEmail);

  if (user) {
    throw ApiError.Conflict('User with this email already exists'); 
  }

  await emailService.sendToken(newEmail, resetToken, 'Email');

  res.status(200);
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('resetToken', resetToken, {
      httpOnly: true,
      maxAge: 1200,
    })
  );
  res.end();
};

export const resetEmail = async (req, res) => {
  const { oldEmail, newEmail, token } = req.body;
  const { resetToken } = req.cookies;

  if (!resetToken) {
    throw ApiError.NotFound('Token is too old. Please get new one');
  }

  if (token !== resetToken) {
    throw ApiError.BadRequest('Tokens do not match');
  }

  const user = await userService.getByEmail(oldEmail);

  if (!user) {
    throw ApiError.NotFound('It seams your email was changed');
  }

  await emailService.sendNotifyEmail(oldEmail, newEmail);

  user.email = newEmail;
  await user.save();

  res.send(userService.normalize(user));
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const passwordError = isPasswordInvalid(newPassword);

  if (passwordError) {
    throw ApiError.BadRequest(passwordError);
  }

  const user = await userService.getByEmail(email);

  if (!user) {
    throw ApiError.NotFound('It seams your email was changed');
  }

  const isPasswordUsed = await bcrypt.compare(newPassword, user.password);

  if (isPasswordUsed) {
    throw ApiError.Conflict('You already use this password');
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashPassword;
  await user.save();

  res.send(userService.normalize(user));
};
