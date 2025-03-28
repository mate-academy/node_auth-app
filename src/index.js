/* eslint-disable no-console */
'use strict';

const { createServer } = require('./utils/createServer');

const startServer = async () => {
  const server = await createServer();
  const PORT = process.env.PORT || 3005;

  server.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
};

startServer();
