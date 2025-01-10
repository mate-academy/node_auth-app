import { PrismaClient } from '@prisma/client';

require('dotenv').config();

export const db = new PrismaClient();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.USERNAME,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    dialect: 'postgres',
  },
);

module.exports = { sequelize };
