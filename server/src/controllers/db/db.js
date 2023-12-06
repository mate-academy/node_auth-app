'use strict';
import Sequelize from 'sequelize';

export const sequelizeConnection = new Sequelize(
  process.env.DB_NAME,
  process.env.USER_NAME,
  process.env.USER_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
  });
