import { userService } from '../services/user.service.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from '../services/email.service.js';
import { jwtService } from '../services/jwt.service.js';
import { tokenService } from '../services/token.service.js';

function validateEmail(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!emailPattern.test(value)) {
    return 'Email is not valid';
  }
}

const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
};

const registration = async (req, res) => {
  const { email, password, name } = req.body;

  const errors = {
    password: validatePassword(password),
    email: validateEmail(email),
  };

  if (errors.password || errors.email) {
    res.sendStatus(400);

    return;
  }

  const user = await userService.getUserByEmail(email);

  if (user) {
    res.sendStatus(400);

    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const activationToken = uuidv4();

  const newUser = await userService.addUser(
    email,
    hashedPassword,
    activationToken,
    name,
  );

  await emailService.sendActivationEmail(email, activationToken);

  const userData = userService.normalizedUser(newUser);

  res.status(201).send({
    userData,
  });
};

const activate = async (req, res) => {
  const { token } = req.params;

  const user = await userService.getUserByToken(token);

  if (!user) {
    res.sendStatus(400);

    return;
  }

  user.activationToken = null;

  await user.save();

  res.status(200).send('activated');
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.getUserByEmail(email);

  if (!user) {
    return res.sendStatus(401);
  }

  if (user.activationToken) {
    return res.status(400).send('Please activate your email');
  }

  const isPasswordValide = await bcrypt.compare(password, user.password);

  if (!isPasswordValide) {
    return res.sendStatus(401);
  }

  const normalizedUser = userService.normalizedUser(user);

  const accessToken = jwtService.generateAccessToken(normalizedUser);
  const newRefreshToken = jwtService.generateAccessTokenRefresh(normalizedUser);

  await tokenService.saveToken(user.id, newRefreshToken);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  await tokenService.removeToken(refreshToken);

  res.clearCookie('refreshToken').sendStatus(204);
};

const refreshenToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).send('401 Unauthorized');
  }

  const token = await jwtService.verifyAccessTokenRefresh(refreshToken);

  if (!token) {
    return res.status(401).send('401 Unauthorized');
  }

  const tokenData = await tokenService.findByToken(refreshToken);
  const userData = await userService.getById(token.id);

  if (!tokenData || !userData) {
    return res.status(401).send('401 Unauthorized');
  }

  const normalizedUser = userService.normalizedUser(userData);

  const newAccessToken = jwtService.generateAccessToken(normalizedUser);
  const newRefreshToken = jwtService.generateAccessTokenRefresh(normalizedUser);

  await tokenService.saveToken(userData.id, newRefreshToken);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({
    user: normalizedUser,
    newAccessToken,
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userService.getUserByEmail(email);

  if (!user) {
    return res.status(404).send('wrong email');
  }

  const resetToken = uuidv4();

  user.resetToken = resetToken;
  await user.save();
  await emailService.sendResetPassword(email, resetToken);

  res.sendStatus(200);
};

const resetPassword = async (req, res) => {
  const { newPassword, resetToken, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(401).send('passwords do not match');
  }

  const user = await userService.getUserByResetToken(resetToken);

  if (!user) {
    return res.status(404).send('user not found');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetToken = null;
  await user.save();

  res.sendStatus(200);
};

const updateName = async (req, res) => {
  const { newName } = req.body;
  const { refreshToken } = req.cookies;

  const token = await tokenService.getUserByToken(refreshToken);

  const user = await userService.getById(token.userId);

  if (!user) {
    return res.status(404).send('Something went wrong');
  }

  user.name = newName;

  await user.save();

  res.sendStatus(200);
};
const emailUpdate = async (req, res) => {
  const { newEmail, password } = req.body;
  const { refreshToken } = req.cookies;

  const userToken = await tokenService.findByToken(refreshToken);

  if (!userToken) {
    return res.status(401).send('wrong token');
  }

  const user = await userService.getById(userToken.userId);

  if (!user) {
    return res.sendStatus(404);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(401).send('wrong password');
  }

  const isEmailBooked = userService.getUserByEmail(newEmail);

  if (isEmailBooked) {
    return res.status(409).send('this email is already used');
  }

  const activationToken = uuidv4();

  user.email = newEmail;
  user.activationToken = activationToken;
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { refreshToken } = req.cookies;

  const userToken = await tokenService.findByToken(refreshToken);

  if (!userToken) {
    return res.status(401).send('wrong token');
  }

  const user = await userService.getById(userToken.userId);

  if (!user) {
    return res.sendStatus(404);
  }

  const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordCorrect) {
    return res.status(401).send('wrong password');
  }

  const newHashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = newHashedPassword;

  await user.save();

  res.sendStatus(200);
};

export const authController = {
  registration,
  activate,
  login,
  logout,
  refreshenToken,
  forgotPassword,
  resetPassword,
  updatePassword,
  emailUpdate,
  updateName,
};
