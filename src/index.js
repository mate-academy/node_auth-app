'use strict';

require('dotenv').config();

const { createServer } = require('./createServer');

const PORT = process.env.PORT || 5700;

createServer().listen(PORT, () => {
  // eslint-disable-next-line
  console.log(`Server is running on localhost:${PORT}`);
});
