import {
  integer,
  pgSchema,
  varchar,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

export const storeData = pgSchema('store_data');

export const userRoleEnum = storeData.enum('user_role', ['user', 'admin']);

export type UserCreate = InferInsertModel<typeof usersTable>;
export type UserSelect = InferSelectModel<typeof usersTable>;

export const usersTable = storeData.table('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: userRoleEnum().default('user').notNull(),
  password: text().notNull(),
  activationToken: text('activation_token'),
  resetPasswordToken: text('reset_password_token'),
  isActivated: boolean('is_activated').notNull().default(false),
  refreshToken: text('refresh_token'),
  resetEmailToken: text('reset_email_token'),
});
