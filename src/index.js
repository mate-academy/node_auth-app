'use strict';

const dotenv = require('dotenv');

dotenv.config();

const { createServer } = require('./api/utils/createServer');

createServer().listen(process.env.SERVER_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server run on port: ${process.env.SERVER_PORT}`);
});
