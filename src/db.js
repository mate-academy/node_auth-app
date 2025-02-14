/* eslint-disable no-console */
'use strict';
import dotenv from 'dotenv';

import { Sequelize } from 'sequelize';
dotenv.config();

export const client = new Sequelize({
  database: process.env.POSTGRES_DB,
  username: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  dialect: 'postgres',
  port: process.env.POSTGRES_PORT,
  password: process.env.POSTGRES_PASSWORD,
});
