'use strict';

const { createServer } = require('./createServer.js');

const server = createServer();
const PORT = process.env.PORT || 3005;

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});
