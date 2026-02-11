'use strict';

import { Sequelize } from 'sequelize';
import * as utils from 'util';
import dotenv from 'dotenv';
import './setup.js';

// Load environment variables
dotenv.config();

// Needed for testing purposes, do not remove
global.TextEncoder = utils.TextEncoder;

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
} = process.env;

const sequelize = new Sequelize({
  database: POSTGRES_DB,
  username: POSTGRES_USER,
  host: POSTGRES_HOST,
  dialect: 'postgres',
  port: POSTGRES_PORT,
  password: POSTGRES_PASSWORD,
});

// Export using ES modules
export { sequelize };
