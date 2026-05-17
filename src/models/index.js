'use strict';

import sequelize from '../db.js';
import User from './User.model.js';

export const initDb = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
};

export { User };
