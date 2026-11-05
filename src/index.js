'use strict';
require('dotenv/config');

const { createServer } = require('./app');
const PORT = process.env.PORT || 3005;

createServer().listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
