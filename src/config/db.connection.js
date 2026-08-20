import { Sequelize } from 'sequelize';
import 'dotenv/config';

const env = process.env;

const sequelize = new Sequelize(env.DB_NAME, env.DB_USERNAME, env.DB_PASSWORD, {
  dialect: env.DB_DIALECT,
});

export default sequelize;
