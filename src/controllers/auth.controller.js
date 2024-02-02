import { User } from "../models/User.js";
import { usersService } from "../services/user.service.js";
import { jwtService } from "../services/jwt.service.js";
import { ApiError } from "../exeptions/api.error.js";
import bcrypt from "bcrypt";
import { tokenService } from "../services/token.service.js";
import { validateEmail, validateName, validatePassword } from "../utils/validation.js";


const register = async (req, res) => {
  const { name, email, password } = req.body;

  const errors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password || errors.name) {
    throw ApiError.badRequest("Bad request", errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await usersService.register(email, hashedPassword, name);

  res.send({ message: "OK" });
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

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  console.log("password: ", password);

  const user = await usersService.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest("No such user");
  }

  const isPassValid = await bcrypt.compare(password, user.password);

  if (!isPassValid) {
    throw ApiError.badRequest("Wrong password");
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = await jwtService.verifyRefresh(refreshToken);
  const token = await tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  await generateTokens(res, user);
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  const userData = await jwtService.verifyRefresh(refreshToken);

  if (!userData || !refreshToken) {
    throw ApiError.unauthorized();
  }

  await tokenService.remove(userData.id);

  res.sendStatus(204);
};

const generateTokens = async (res, user) => {
  const normalizedUser = usersService.normalize(user);

  const accessToken = await jwtService.sign(normalizedUser);
  const refreshToken = await jwtService.signRefresh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.send({
    user: normalizedUser,
    accessToken,
  });
};

const reset = async (req, res) => {
  const { email } = req.body;

  const errors = {
    email: validateEmail(email),
  };

  if (errors.email) {
    throw ApiError.badRequest("Bad request", errors);
  }

  await usersService.reset(email);

  res.status(200).send({ message: "Check your email." });
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const user = await User.findOne({ where: { resetToken } });

  if (!user) {
    res.sendStatus(404);
    return;
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.save();

  res.status(200).send({ message: "Password successfully changed" });
};

export const authController = {
  register,
  activate,
  login,
  refresh,
  logout,
  reset,
  resetPassword,
};
