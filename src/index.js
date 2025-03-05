'use strict';

require('dotenv').config();

const { createServer } = require('./createServer');

const port = process.env.SERVER_PORT || 3000;

createServer().listen(port, () => {
  /* eslint-disable-next-line no-console */
  console.log(`Server is running on localhost: ${port}`);
});
