import { User } from '../models/user.js';

const getUserById = (id) => {
  return User.findOne({
    where: { id: id },
  });
};

export const profileService = {
  getUserById,
};
