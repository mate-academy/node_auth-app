import { db } from '../utils/db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './email.service.js';

function getAllActive() {
  return db.user.findMany({
    where: {
      activationToken: null,
    },
  });
}

function findByEmail(email) {
  return db.user.findUnique({ where: { email } });
}

async function register(email, password, userName) {
  const isExist = await db.user.findUnique({ where: { email } });

  if (isExist) {
    throw new Error('Validation error: Email is already taken');
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const activationToken = uuidv4();
  const tokenActivationExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

  try {
    await emailService.sendEmail({
      email,
      type: 'Activation',
      token: activationToken,
    });

    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        userName,
        activationToken,
        tokenActivationExpires,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

async function activate(activationToken) {
  const user = await db.user.findUnique({ where: { activationToken } });

  if (!user) {
    throw new Error('Invalid or expired activation token');
  }

  if (
    !user.tokenActivationExpires ||
    user.tokenActivationExpires < new Date()
  ) {
    throw new Error('Activation token expired');
  }

  const updateDate = {
    activationToken: null,
    tokenActivationExpires: null,
  };

  if (user.pendingEmail) {
    updateDate.email = user.pendingEmail;
    updateDate.pendingEmail = null;
  }

  return db.user.update({
    where: {
      id: user.id,
    },
    data: updateDate,
  });
}

function normalize({ id, email }) {
  return { id, email };
}

function update(userId, data) {
  return db.user.update({
    where: { id: userId },
    data,
  });
}

function getByUserId(userId) {
  return db.user.findUnique({
    where: { id: userId },
  });
}

export const userService = {
  getAllActive,
  findByEmail,
  register,
  activate,
  normalize,
  update,
  getByUserId,
};
