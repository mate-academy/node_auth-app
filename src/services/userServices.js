import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from '../services/emailService.js';
import { ApiError } from '../exceptions/ApiError.js';
import { User } from '../models/User.js';

function getAllActive() {
  return User.findAll({
    where: { activationToken: null },
  });
}

function getByEmail(email) {
  return User.findOne({
    where: { email },
  });
}

async function register({ email, password, name }) {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('Email is already taken', {
      email: 'Email is already taken'
    });
  }

  const activationToken = uuidv4();

  const hash = await bcrypt.hash(password, 10);
  

  const user = await User.create({
    name,
    email,
    password: hash,
    activationToken,
  });

  await emailService.sendActivationLink(email, activationToken);
}

const registerWithGoogle = async(email, password, name) => {
  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw ApiError.BadRequest('User already exists');
  }

  const hash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hash,
    withGoogle: true,
  });
};

function normalize({ id, email, name, withGoogle }) {
  return {
    id,
    email,
    name,
    withGoogle,
  };
}

const generateRestoreCode = () => {
  const restoreCode = uuidv4();

  return restoreCode;
};

export const userService = {
  getAllActive,
  getByEmail,
  register,
  registerWithGoogle,
  normalize,
  generateRestoreCode,
};
