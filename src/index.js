/* eslint-disable no-console */
'use strict';

const { createServer } = require('./utils/createServer');
const dotenv = require('dotenv');

dotenv.config();

const startServer = async () => {
  const server = await createServer();

  server.listen(process.env.PORT, () => {
    console.log(`Server running on port: ${process.env.PORT}`);
  });
};

startServer();
