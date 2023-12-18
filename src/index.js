'use strict';
require('dotenv/config');

const { createServer } = require('./utils/server.js');

const PORT = process.env.PORT;
const app = createServer(PORT);

app.get('/', (req, res) => {
  res.send('Hello');
});
