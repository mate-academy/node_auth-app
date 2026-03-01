import { User } from "../models/User.js";

export const findByEmail = (email) => {
  return User.findOne({ where: { email } });
};

export const findById = (id) => {
  return User.findByPk(id);
};

export const findByResetToken = (token) => {
  return User.findOne({ where: { passwordResetToken: token } });
};
