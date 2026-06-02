import { RequestHandler } from "express";
import bcrypt from 'bcrypt';
import { usersRepository } from "../entity/users.repository";
import { mailer } from "../services/email.service";

const register: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const activationToken = bcrypt.genSaltSync(1);
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await usersRepository.create(email, hashedPassword, activationToken);

  if (!user.activationToken) {
    return res.status(500).json({ error: "Activation token missing" });
  }
  await mailer.sendActivationLink(email, activationToken);

  res.json({ user });
};

const getUsers: RequestHandler = async (req, res) => {
  const users = await usersRepository.getAll();
  res.json(users);
};

const activate: RequestHandler = async (req, res) => {
  const { email, activationToken } = req.params;

  const user = await usersRepository.getByEmail(email as string);

  if (!user || user.activationToken !== activationToken) {
    return res.status(400).json({ message: 'Wrong activation link' });
  }

  const activatedUser = await usersRepository.activate(email as string);

  res.json({ user: activatedUser });
};

export const authController = {
  register,
  getUsers,
  activate,
};

