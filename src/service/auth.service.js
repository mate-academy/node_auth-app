import { User } from "../models/User.model.js";
import { emailService } from "../service/email.service.js";
import { v4 as uuidv4 } from 'uuid';
import { findByEmail } from "../utils/findByEmail.js";
import { ApiError } from "../exeptions/api.error.js";

const register = async (name, email, password) => {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    })
  }

  await User.create({ name, email, password, activationToken });

  await emailService.sendActivationEmail(email, activationToken);
}

export const authService = {
  register,
}