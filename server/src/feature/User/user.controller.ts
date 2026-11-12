import type { RequestHandler } from "express";
import { userRepository } from "./user.repository.js";
import { normalizeUser } from "./utils.js";
import { userService } from "./user.service.js";

const getAll: RequestHandler = async (req, res) => {
  const users = await userService.getAll();

  return res.json(users);
};

export const userController = {
  getAll,
};

