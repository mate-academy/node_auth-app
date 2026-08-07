'use strict';

require('dotenv').config();

const { sequelize } = require('./config/database');

require('./models');

const { createServer } = require('./createServer');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();

    // eslint-disable-next-line no-console
    console.log('Database connection established');

    await sequelize.sync({ alter: true });

    const server = createServer().listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    server.on('close', () => {
      // eslint-disable-next-line no-console
      console.log('HTTP server was closed');
    });

    server.on('error', (error) => {
      // eslint-disable-next-line no-console
      console.error('HTTP server error:', error);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to start the server:', error);
    process.exit(1);
  }
}

startServer();
