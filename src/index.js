'use strict';
require('dotenv').config();

const createServer = require('./app');

const app = createServer();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
