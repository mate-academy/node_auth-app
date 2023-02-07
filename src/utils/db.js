'use strict';

import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
  process.env.POSTGRES_DB_LINK, { logging: false }
);
