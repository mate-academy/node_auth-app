import type { User } from "../../models/User.model.js";
import { userRepository } from "./user.repository.js";
import { normalizeUser } from "./utils.js";

const getAll = async () => {
  const users = await userRepository.getAll();

  return users.map(normalizeUser)
}

export const userService = {
  getAll,
}
