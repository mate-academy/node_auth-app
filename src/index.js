/* eslint-disable no-console */
'use strict';

import 'dotenv/config';

import { sequelize } from './db.js';
import './models/User.js';
import './models/Token.js';
import { createServer } from './app.js';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();

    await sequelize.sync();

    createServer().listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

start();
