/* eslint-disable no-console */
'use strict';

import 'dotenv/config';
import chalk from 'chalk';
import { createServer } from './create-server.js';

const apiPort = process.env.API_PORT || 3000;

createServer().listen(apiPort, () => {
  console.log(
    chalk.cyanBright(
      `Server is running on ${chalk.yellow(`localhost:${apiPort}`)}`,
    ),
  );
});
