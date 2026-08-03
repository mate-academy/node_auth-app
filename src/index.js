'use strict';
require('dotenv').config();

const { createApp } = require('./app.js');

const PORT = process.env.PORT || 3005;
const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}/`);
});
