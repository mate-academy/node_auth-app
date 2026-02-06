'use strict';
import { Sequelize } from 'sequelize';
import { DBError } from '../errors/index.ts';

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
} = process.env;

const client = new Sequelize({
  database: POSTGRES_DB || 'postgres',
  username: POSTGRES_USER || 'postgres',
  host: POSTGRES_HOST || 'localhost',
  dialect: 'postgres',
  port: Number(POSTGRES_PORT) || 5432,
  password: POSTGRES_PASSWORD || '123',
});

const dbSetup = async () => {
  try {
    const { default: DB } = await import('../model/index.ts');

    for (const model of Object.values(DB)) {
      await model.sync();
    }
  } catch (error) {
    throw new DBError(`Database setup failed: ${error}`);
  }
};

export { client, dbSetup };
