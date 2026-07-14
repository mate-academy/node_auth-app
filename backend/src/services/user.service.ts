import { eq, type RequireAtLeastOne } from 'drizzle-orm';
import { db } from '../db/db.ts';
import {
  usersTable,
  type UserCreate,
  type UserSelect,
} from '../db/schema/users.ts';
import type { JwtPayload } from 'jsonwebtoken';

export type NormalizedUser = Pick<
  UserSelect,
  'id' | 'email' | 'role' | 'lastName' | 'firstName'
>;

function normalize({
  id,
  email,
  role,
  lastName,
  firstName,
}: UserSelect | (JwtPayload & NormalizedUser)): NormalizedUser {
  return { id, email, role, lastName, firstName };
}

async function getByEmail(email: string) {
  const [existUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return existUser;
}

async function getById(id: number) {
  const [existUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));

  return existUser;
}

async function update(id: number, params: RequireAtLeastOne<UserCreate>) {
  const [updatedUser] = await db
    .update(usersTable)
    .set(params)
    .where(eq(usersTable.id, id))
    .returning();
  return updatedUser;
}

async function create(user: UserCreate) {
  const [newUser] = await db.insert(usersTable).values(user).returning();
  return newUser;
}

async function getByActivationToken(activationToken: string) {
  const [result] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.activationToken, activationToken));

  return result;
}

export const userService = {
  update,
  normalize,
  getByEmail,
  create,
  getByActivationToken,
  getById,
};
