'use strict';

const { createServer } = require('./utils/createServer');

require('dotenv').config();

const server = createServer();

server.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server is listening...');
});
