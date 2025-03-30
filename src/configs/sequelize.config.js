import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  dialect: process.env.DATABASE_DIALECT,
});

const authenticate = async () => {
  try {
    await sequelize.authenticate();
  } catch (err) {
    throw new Error(`Error connecting to the database: ${err}`);
  }
};

authenticate();

export default sequelize;
