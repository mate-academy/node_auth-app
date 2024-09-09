import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user.js';
import 'dotenv/config';
import { ApiError } from '../exeptions/api-error.js';
import bcrypt from 'bcrypt'

export const createActivationToken = () => {
  return uuidv4();
};

export const comparePasswords = (incomingPassword, userPassword) => {
  return bcrypt.compare(incomingPassword, userPassword);
};

export const createUser = async ({ email, password, activationToken }) => {
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser !== null) {
    throw ApiError.BadRequest("This is existing user", {
      email: "That e-mail adress is used by another person"
    })
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashedPassword, activationToken });

  return { id: user.id, email: user.email };
};

export const findUserByToken = (activationToken) => {
  return User.findOne({
    where: { activationToken },
    attributes: ['id', 'email'],
  });
};

export const consumeToken = async (user) => {
  user.activationToken = null;
  await user.save();
};

export const findActiveUserByEmail = (email) => {
  return User.findOne({ where: { email, activationToken: null } });
};


