import { RequestHandler } from "express";
import { usersRepository } from "../entity/users.repository";

const register: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  const user = await usersRepository.create(email, password);
  res.json({ user });
};

const getUsers: RequestHandler = async (req, res) => {
  const users = await usersRepository.getAll();
  res.json(users);
};

export const authController = {
  register,
  getUsers
};
