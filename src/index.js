'use strict';

const { createServer } = require('./createServer');
const { sequelize } = require('./db');

const PORT = 3000;

sequelize
  .sync({ alter: true })
  .then(() => {
    createServer().listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.log('Unable to connect to the database:', err);
  });
