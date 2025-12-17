/* eslint-disable no-console */
import 'dotenv/config';

import { app } from './app.js';
import sequelize from './config/database.js';

const PORT = process.env.PORT || 3002;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
