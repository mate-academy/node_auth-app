import type { User } from '../../generated/prisma/client.ts';
import { prisma } from '../db.ts';
import type { RawUser, UserPropsToUpdate } from '../types/index.js';

const normalize = ({ id, name, email }: User) => {
  return {
    id,
    name,
    email,
  };
};

const create = async ({ name, email, password }: RawUser): Promise<User> => {
  return prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });
};

const getByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findFirst({
    where: {
      email,
    },
  });
};

const getById = async (id: string): Promise<User | null> => {
  return prisma.user.findFirst({
    where: {
      id,
    },
  });
};

const deleteActivationToken = async (id: string) => {
  return prisma.user.update({
    where: {
      id,
    },
    data: { activationToken: null },
  });
};

const change = async (
  userId: string,
  toChange: UserPropsToUpdate,
) => {
  return prisma.user.update({
    where: {
      id: userId
    },
    data: toChange,
  })
};

const updatePasswordToken =  async (id: string, passwordToken: string | null) => {
  return prisma.user.update({
    where: {
      id
    },
    data: {
      passwordToken
    }
  })
}

export { create, normalize, getByEmail, deleteActivationToken, getById, change, updatePasswordToken };
