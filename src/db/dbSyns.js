/**
 * Synchronizes all defined models with the database.
 *
 * This will create new tables and overwrite existing ones,
 * effectively resetting the database schema. Use with caution
 * as this will delete all existing data in the tables.
 */
import 'dotenv/config';
// import UserSchema from '../model/user.js'; // require import Shema for update
// import TokensSchema from '../model/tokens.js';
import { sequelize } from './connection.js';

sequelize.sync({ force: true });
