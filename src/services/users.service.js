import { User } from "../models/User.js";
import {ApiError} from "../exeptions/api.error.js";
import {v4} from "uuid";
import {tokenService} from "./token.service.js";
import {emailService} from "./email.service.js";

const getAllActivated = async() => {
  return User.findAll({ where: { activationToken: null }});
};

const normalize = ({id, email}) => {
  return {id, email}
};

async function updateName(id, name) {
  const user = await User.findOne({ where: { id } });

  user.name = name;
  await user.save();

  return normalize(user);
}

async function updateEmail(id, email) {
  const isExist = await User.findOne({ where: { email } });

  if (isExist) {
    throw ApiError.badRequest('User with such email already exist');
  }

  const user = await User.findOne({ where: { id } });
  const confirmEmailToken = v4();
  const oldEmail = user.email;

  user.email = email;
  user.activationToken = confirmEmailToken;

  await user.save();
  await tokenService.remove(id);

  await emailService.sendActivationMail(email, confirmEmailToken);
  await emailService.sendChangeMail(oldEmail);
}

export const usersService = {
  getAllActivated, normalize, updateEmail,
};
