'use strict';

/* eslint-disable no-console */

const { createServer } = require('./createServer');

const PORT = process.env.PORT || 3005;

createServer().listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});
