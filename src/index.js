'use strict';
const app = require('./app.js');
require('dotenv').config();

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log('server is running');
});
