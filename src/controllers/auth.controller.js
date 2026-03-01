import { User } from "../models/User.js";
import { emailService } from "../services/email.services.js";
import * as userService from "../services/user.service.js";
import { v4 as uuidv4 } from "uuid";
import { jwtService } from "../services/jwt.sevrices.js";
import { catchError } from "../utils/catchError.js";
import { ApiError } from "../exeptions/api.error.js";
import bcrypt from "bcrypt";

const validateEmail = (value) => {
  if (!value) return "Email is required";
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;
  if (!emailPattern.test(value)) return "Email is not valid";
};

const validatePassword = (value) => {
  if (!value) return "Password is required";
  if (value.length < 6) return "At least 6 characters";
};

const registration = catchError(async (req, res) => {
  const { name, email, password } = req.body;
  const activateToken = uuidv4();

  const errors = {
    name: !name ? "Name is required" : undefined,
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.name || errors.email || errors.password) {
    throw ApiError.badRequest("Bad request", errors);
  }

  const existingUser = await userService.findByEmail(email);
  if (existingUser) {
    throw ApiError.badRequest("Email error", { email: "Email is already taken" });
  }

  const hashedPass = await bcrypt.hash(password, 10);

  const newUser = await User.create({ name, email, password: hashedPass, activateToken });

  await emailService.sendActivationEmail(email, activateToken);

  res.send(newUser);
});

const activate = catchError(async (req, res) => {
  const { activateToken } = req.params;
  const user = await User.findOne({ where: { activateToken } });

  if (!user) throw ApiError.notFound();

  user.activateToken = null;
  await user.save();

  res.send(user);
});

const login = catchError(async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: !email ? "Email is required" : undefined,
    password: !password ? "Password is required" : undefined,
  };

  if (errors.email || errors.password) {
    throw ApiError.badRequest("Missing fields", errors);
  }

  const user = await userService.findByEmail(email);

  if (!user) throw ApiError.badRequest("No such user");

  if (user.activateToken) {
    throw ApiError.badRequest("Please activate your email first");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw ApiError.badRequest("Wrong password");

  const userData = { id: user.id, email: user.email, name: user.name };
  const accessToken = jwtService.signAccess(userData);
  const refreshToken = jwtService.signRefresh(userData);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({ user: userData, accessToken });
});

const refresh = catchError(async (req, res) => {
  const { refreshToken } = req.cookies;
  const userData = jwtService.verifyRefresh(refreshToken);

  if (!userData) throw ApiError.unauthorized();

  const user = await userService.findById(userData.id);
  if (!user) throw ApiError.unauthorized();

  const newUserData = { id: user.id, email: user.email, name: user.name };
  const newAccessToken = jwtService.signAccess(newUserData);
  const newRefreshToken = jwtService.signRefresh(newUserData);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.send({ user: newUserData, accessToken: newAccessToken });
});

const logout = catchError(async (req, res) => {
  res.clearCookie("refreshToken");
  res.sendStatus(204);
});


const requestPasswordReset = catchError(async (req, res) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest("Email is required");

  const user = await userService.findByEmail(email);
  if (user) {
    const resetToken = uuidv4();
    user.passwordResetToken = resetToken;
    await user.save();
    await emailService.sendPasswordResetEmail(email, resetToken);
  }

  res.send({ message: "If this email exists, a reset link has been sent" });
});

const confirmPasswordReset = catchError(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const error = validatePassword(password);
  if (error) throw ApiError.badRequest(error);

  const user = await userService.findByResetToken(token);
  if (!user) throw ApiError.badRequest("Invalid or expired reset token");

  user.password = await bcrypt.hash(password, 10);
  user.passwordResetToken = null;
  await user.save();

  res.send({ message: "Password has been reset successfully" });
});


const changeName = catchError(async (req, res) => {
  const { name } = req.body;
  if (!name) throw ApiError.badRequest("Name is required");

  const user = await userService.findById(req.user.id);
  if (!user) throw ApiError.notFound();

  user.name = name;
  await user.save();

  res.send({ id: user.id, email: user.email, name: user.name });
});

const changePassword = catchError(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const error = validatePassword(newPassword);
  if (error) throw ApiError.badRequest(error);

  const user = await userService.findById(req.user.id);
  if (!user) throw ApiError.notFound();

  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) throw ApiError.badRequest("Old password is incorrect");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.send({ message: "Password changed successfully" });
});

const changeEmail = catchError(async (req, res) => {
  const { email } = req.body;

  const error = validateEmail(email);
  if (error) throw ApiError.badRequest(error);

  const existing = await userService.findByEmail(email);
  if (existing) throw ApiError.badRequest("Email is already taken");

  const user = await userService.findById(req.user.id);
  if (!user) throw ApiError.notFound();

  const oldEmail = user.email;
  user.email = email;
  await user.save();

  await emailService.sendEmailChangedNotification(oldEmail, email);

  res.send({ id: user.id, email: user.email, name: user.name });
});

export const AuthController = {
  registration,
  activate,
  login,
  refresh,
  logout,
  requestPasswordReset,
  confirmPasswordReset,
  changeName,
  changePassword,
  changeEmail,
};
