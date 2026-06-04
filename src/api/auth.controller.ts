import { RequestHandler } from "express";
import bcrypt from 'bcrypt';
import { usersRepository } from "../entity/users.repository";
import { mailer } from "../services/email.service";
import { userService } from "../services/user.service";
import { jwt } from "../utils/jwt";

const register: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const activationToken = bcrypt.genSaltSync(1);
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await usersRepository.create(email, hashedPassword, activationToken);

  if (!user.activationToken) {
    return res.status(500).json({ error: "Activation token missing" });
  }
  await mailer.sendActivationLink(email, activationToken);

  res.json({ user: userService.normalize(user) });
};

const getUsers: RequestHandler = async (req, res) => {
  const users = await usersRepository.getAll();
  res.json(users.map(userService.normalize));
};

const activate: RequestHandler = async (req, res) => {
  const { email, activationToken } = req.params;

  const decodedEmail = decodeURIComponent(email as string);
  const decodedActivationToken = decodeURIComponent(activationToken as string);

  const user = await usersRepository.getByEmail(decodedEmail);

  if (!user || user.activationToken !== decodedActivationToken) {
    return res.status(400).json({ message: 'Wrong activation link' });
  }

  const activatedUser = await usersRepository.activate(decodedEmail);
  const normalizedUser = userService.normalize(activatedUser);

  res.json({ user: normalizedUser, accessToken: jwt.generateAccessToken(normalizedUser) });
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepository.getByEmail(email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const normalizedUser = userService.normalize(user);

  const refreshToken = jwt.generateRefreshToken(normalizedUser);
  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // res.cookie('refreshToken', refreshToken, {
  //   maxAge: 30 * 24 * 60 * 60 * 1000,
  //   httpOnly: true,
  //   sameSite: 'none',
  //   secure: true,
  // });

  // For development purposes, we set secure to false and sameSite to lax. In production, these should be set to true and none respectively.
  res.cookie('refreshToken', refreshToken, {
  maxAge: 30 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
});

  res.json({ user: normalizedUser, accessToken: jwt.generateAccessToken(normalizedUser) });
};

const logout: RequestHandler = async (req, res) => {
  res.clearCookie('refreshToken');
  res.sendStatus(204);
}

export const authController = {
  login,
  register,
  getUsers,
  activate,
  logout,
};

