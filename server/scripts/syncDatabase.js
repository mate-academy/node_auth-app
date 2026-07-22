'use strict';

const { sequelize } = require('../src/config/database');

require('../src/models');

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });

    // eslint-disable-next-line no-console
    console.log('Database tables are synced');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to sync database:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
