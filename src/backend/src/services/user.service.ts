import { Prisma, User } from '../generated/prisma/client.js';
import { prisma } from '../lib/db.js';

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  isActivated: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

async function getPublicUsers(): Promise<PublicUser[]> {
  return await prisma.user.findMany({
    select: publicUserSelect,
  });
}

function normalize(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActivated: user.isActivated,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const userService = {
  getPublicUsers,
  normalize,
};
