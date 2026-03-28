import bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { emailService } from './emailService.js';
import { tokenService } from './tokenService.js';
import { prisma } from '../prismaClient.js';
import { validationUtil } from '../utils/validation.js';
import { NormalizedUser } from '../types/User.js';

function normalize({ id, email }: User): NormalizedUser {
  return { id, email };
}

function getAllActive(): Promise<User[]> {
  return prisma.user.findMany({
    where: {
      isActivated: true,
    },
  });
}

function getByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

async function register({
  email,
  password,
  name,
}: Pick<User, 'email' | 'password' | 'name'>) {
  const emailError = validationUtil.validateEmail(email);

  if (emailError) {
    throw new Error(emailError);
  }

  const passwordError = validationUtil.validatePassword(password);

  if (passwordError) {
    throw new Error(passwordError);
  }

  const existingUser = await getByEmail(email);

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const activationToken = uuidv4();
  const hash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hash,
      activationToken,
    },
  });

  await emailService.sendActivationEmail(email, activationToken);
}

async function activation({
  email,
  activationToken,
}: Pick<User, 'email' | 'activationToken'>) {
  let user = await getByEmail(email);

  if (!user) {
    user = await prisma.user.findFirst({
      where: { newEmail: email },
    });
  }

  if (!user) {
    throw new Error('User not found');
  }

  if (user.activationToken !== activationToken) {
    throw new Error('Invalid activation token');
  }

  if (user.newEmail === email) {
    const oldEmail = user.email;

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: user.newEmail,
        newEmail: null,
        activationToken: null,
      },
    });

    await emailService.sendMessageToChangeEmail(oldEmail);

    return;
  }

  if (user.isActivated && !user.newEmail) {
    throw new Error('User already activated');
  }

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      isActivated: true,
      activationToken: null,
    },
  });
}

async function login({ email, password }: Pick<User, 'email' | 'password'>) {
  const user = await getByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  if (!user.isActivated) {
    throw new Error('User is not activated');
  }

  return normalize(user);
}

async function resetPassword({ email }: Pick<User, 'email'>) {
  const user = await getByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  const resetPasswordToken = tokenService.generateRandomToken();
  const expiryDate = new Date();

  expiryDate.setHours(expiryDate.getHours() + 1);

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      resetPasswordToken,
      resetPasswordExpires: expiryDate,
    },
  });

  await emailService.sendResetPasswordEmail(email, resetPasswordToken);
}

async function confirmResetPassword({
  email,
  password,
  resetPasswordToken,
}: Pick<User, 'email' | 'password' | 'resetPasswordToken'>) {
  const user = await getByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.resetPasswordToken !== resetPasswordToken) {
    throw new Error('Invalid reset password token');
  }

  if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
    throw new Error('Reset password token expired');
  }

  const hash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      password: hash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });
}

async function updateProfile(
  {
    email,
    password,
    name,
  }: { email: string; password?: string; name?: string },
  newPassword?: string,
  newEmail?: string,
) {
  const user = await getByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }

  if (name) {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        name,
      },
    });
  }

  if (password && newPassword) {
    const passwordError = validationUtil.validatePassword(newPassword);

    if (passwordError) {
      throw new Error(passwordError);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        password: hash,
      },
    });
  }

  if (newEmail) {
    if (!password) {
      throw new Error('Password is required to change email');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const activationToken = uuidv4();

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        newEmail: newEmail,
        activationToken,
      },
    });

    await emailService.sendActivationEmail(newEmail, activationToken);
  }
}

export const userService = {
  normalize,
  getAllActive,
  getByEmail,
  register,
  activation,
  login,
  resetPassword,
  confirmResetPassword,
  updateProfile,
};
