/* eslint-disable no-console */
'use strict';

import 'dotenv/config';
import chalk from 'chalk';
import { createServer } from './createServer.js';

const PORT = process.env.API_PORT || 3000;

createServer().listen(PORT, () => {
  console.log(
    chalk.cyanBright(
      `Server is running on ${chalk.yellow(`${process.env.API_HOST}:${PORT}`)}`,
    ),
  );
});
