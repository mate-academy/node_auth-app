import { ApiError } from "../exceptions/api.error.js";
import { User } from "../models/User.model.js";
import { emailService } from '../services/email.service.js';
import { v4 as uuid } from 'uuid';
import { Token } from "../models/token.js";

const getUser = async (refreshToken) => {
  const user = await User.findOne({
    include: {
      model: Token,
      where: { refreshToken },
    },
  });

  return user;
};

const normilize = (user) => {
  const { email, id, name } = user;

  return { email, id, name };
};

const findByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });

  return user;
};

const registration = async (email, password, name) => {
  const activationToken = uuid();

  const userExist = await findByEmail(email);

  if (userExist) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    })
  }

  const user = await User.create({ email, password, name, activationToken });

  await emailService.sendActivationEmail(email, activationToken);

  return user;
}

export const userServices = {
  normilize,
  findByEmail,
  getUser,
  registration,
};
