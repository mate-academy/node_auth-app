import { userRepository } from "./user.repository.js";
import { normalizeUser, type NormalizedUser } from "./utils.js";

const getAll = async (): Promise<NormalizedUser[]> => {
  const users = await userRepository.getAll();

  return users.map(normalizeUser)
}

export const userService = {
  getAll,
}
