import { ApiError } from "../exceptions/api.error.js";
import { User } from "../models/user.js"
import { v4 as uuidv4 } from 'uuid';
import { emailService } from "./email.service.js";
import { validationService } from "./validation.service.js";

const normalize = ({ id, name, email }) => ({
  id, name, email
})

const findByEmail = (email) => {
  return User.findOne({ where: { email }})
}

const findById = (id) => {
  return User.findOne({ where: { id }})
}

const findByPasswordResetToken = (passwordResetToken) => {
  return User.findOne({ where: { passwordResetToken }})
}

const register = async ({ email, password, name }) => {
  const activationToken = uuidv4();
  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exist', {
      email: 'Email is already used'
    })
  }
  const errors = { 
    email: validationService.validateEmail(email),
    name: validationService.validateName(name),
    password: validationService.validatePassword(password),
  };

  if (errors.email || errors.name || errors.password) {
    throw ApiError.badRequest('validation error', errors);
  }

  const newUser = await User.create({ email, password, activationToken, name });
  await emailService.sendActivationEmail(email, activationToken);
  return normalize(newUser)
}

export const userService = {
  normalize,
  findByEmail,
  findById,
  findByPasswordResetToken,
  register
}