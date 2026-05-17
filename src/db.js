'use strict';

import { Sequelize } from 'sequelize';

const usePostgres = Boolean(
  process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASS,
);

let sequelize;

if (usePostgres) {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    },
  );
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || 'database.sqlite',
    logging: false,
  });
}

export default sequelize;
