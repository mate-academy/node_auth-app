import { Sequelize } from 'sequelize';

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_DIALECT,
} = process.env;

const requiredEnv = {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_DB,
  POSTGRES_DIALECT,
};

for (const [key, value] of Object.entries(requiredEnv)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const isSSL = process.env.POSTGRES_SSL === 'true';

export const sequelize = new Sequelize({
  database: POSTGRES_DB,
  username: POSTGRES_USER,
  host: POSTGRES_HOST,
  dialect: POSTGRES_DIALECT,
  port: POSTGRES_PORT,
  password: POSTGRES_PASSWORD,
  ...(isSSL && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
