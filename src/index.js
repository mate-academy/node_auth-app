'use strict';

import { createServer } from './createServer.js';
import { dbInit } from './utils/dbInit.js';

async function start() {
  try {
    await dbInit();

    createServer().listen(3000, () => {
      // eslint-disable-next-line no-console
      console.log('Server is running on localhost:3000');
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to start server:', err);
  }
}

start();
