/* eslint-disable no-console */
'use strict';
import dotenv from 'dotenv';

import { createServer } from './createServer.js';
dotenv.config();

const PORT = process.env.PORT || 3002;

createServer().listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});
