'use strict';

const { createServer } = require('./createServer.js');
const PORT = process.env.PORT || 3004;

createServer().listen(PORT, () => {
  /* eslint-disable-next-line */
  console.log(`Server is running on http://localhost:${PORT}`);
});
