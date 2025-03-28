import { ApiError } from '../exeptions/api.error.js';
import { User } from '../models/user.js';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.services.js';

function getAllActivated() {
  //   const res = User.findAll({
  //     where: {
  //       activationToken: null,
  //     }});

  // console.log(`res: ${res}`)
  return User.findAll({
    where: {
      activationToken: null,
    },
  });
}

const normalize = ({ id, email }) => {
  return { id, email };
};

function findByEmail(email) {
  // const res = User.findOne({ where: { email } });

  return User.findOne({ where: { email } });
}

async function register(email, password) {
  const activationToken = uuidv4();

  const existUser = await findByEmail(email);

  // console.log(`existUser: ${existUser}`)

  if (existUser) {
    throw ApiError.BadRequest('User already exists', {
      email: 'User already exists',
    });
  }

  await User.create({ email, password, activationToken });
  await emailService.sendActivationEmail(email, activationToken);
}

// findByEmail();

export const userService = {
  getAllActivated,
  normalize,
  findByEmail,
  register,
};
