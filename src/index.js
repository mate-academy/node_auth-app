/* eslint-disable no-console */
'use strict';
import { createServer } from './createServer.js';
import 'dotenv/config';

const PORT = process.env.PORT || 7080;

createServer().listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});
