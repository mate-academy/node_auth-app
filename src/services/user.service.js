import { ApiError } from "../exeptions/api.error.js";
import { User } from "../models/user.js";
import { emailService } from "../services/email.service.js";
import { v4 as uuidv4 } from 'uuid';

function getAllActivated() {
    return User.findAll({
      where: {
        activationToken: null
      }
    });
}

function normalize({ id, email }) {
  return { id, email };
}

function findByEmail(email) {
  return User.findOne({where: { email }})
}

async function register(email, password) {
  const activationToken = uuidv4(); // token generation

  const existUser = await findByEmail(email);

  if (existUser) {
    throw  ApiError.badRequest('User already exists', {
      email: 'User already exists'
    });
  }

  await User.create({ email, password, activationToken }); // create a user
  await emailService.sendActivationEmail(email, activationToken);
}

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
};
