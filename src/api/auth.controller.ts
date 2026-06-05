import { RequestHandler, Response } from 'express';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { usersRepository } from "../entity/users.repository";
import { mailer } from "../services/email.service";
import { userService } from "../services/user.service";
import { jwt } from "../utils/jwt";
import { tokensRepository } from '../entity/tokens.repository';

type NormalizedUser = {
  id: string;
  email: string;
};

async function sendAuthentication(res: Response, user: User) {
  const userData = userService.normalize(user);
  const accessToken = jwt.generateAccessToken(userData);
  const refreshToken = jwt.generateRefreshToken(userData);

  await tokensRepository.deleteByUserId(user.id);
  await tokensRepository.create(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: userData,
    accessToken,
  });
}

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

 return sendAuthentication(res, activatedUser);
};

const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepository.getByEmail(email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, user?.password || '');

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  sendAuthentication(res, user);
};

const logout: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken) as NormalizedUser;

  if (userData) {
    await tokensRepository.deleteByUserId(userData.id);
  }

  res.clearCookie('refreshToken');
  res.sendStatus(204);
}

const refresh: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || '';
  const userData = jwt.validateRefreshToken(refreshToken) as NormalizedUser;
  const user = await usersRepository.getByEmail(userData?.email || '');
  const token = await tokensRepository.getByToken(refreshToken);

  if (!user || !userData || !token || token.userId !== user.id) {
    res.clearCookie('refreshToken');
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  await sendAuthentication(res, user);
}

export const authController = {
  refresh,
  login,
  register,
  getUsers,
  activate,
  logout,
};

