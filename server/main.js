'use strict';
import 'dotenv/config';
import { createServer } from './src/createServer.js';

const PORT = process.env.PORT || 3001;

createServer()
  .listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on localhost: ${PORT}`);
  });
