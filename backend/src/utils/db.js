'use strict';

import { Sequelize } from "sequelize"

const {
  DB_DATABASE,
  DB_USER,
  DB_HOST,
  DB_PORT,
  DB_PASSWORD,
} = process.env;

export const client = new Sequelize({
  database: DB_DATABASE || 'postgres',
  username: DB_USER || 'postgres',
  host: DB_HOST || 'localhost',
  dialect: 'postgres',
  port: DB_PORT || 5432,
  password: DB_PASSWORD,
})
