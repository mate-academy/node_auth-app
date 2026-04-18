import { ApiError } from "../exceptions/api.error.js";
import { User } from "../models/user.js"
import { emailService } from "../services/email.service.js";
import { v4 as uuidv4 } from 'uuid';


function getAllActivated() {
  return User.findAll({
    where: { activationToken: null }
  })
}

function normalize({ id, name, email }) {
  return { id, name, email };
}

function findByEmail(email) {
  return User.findOne({ where: { email }})
}

async function register(name, email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  if (existUser) {
    throw ApiError.badRequest('User already exists', {
      email: 'User already exists'
    })
  }

  await User.create({ name, email, password, activationToken })
  await emailService.sendActivationEmail(email, activationToken)
};

async function createResetToken(email) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const user = await User.findOne({ where: { email }});

  user.resetToken = token;
  user.resetTokenExpires = expiresAt;

  await user.save();

  await emailService.sendPasswordResetEmail(email, token);

  return token;
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
  createResetToken,
}
