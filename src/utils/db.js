import { Sequelize }  from 'sequelize';
import 'dotenv/config.js'

export const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: 'localhost',
    dialect: 'postgres'
});
