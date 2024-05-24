'use strict';

const { createServer } = require('./services/createServer.js');

const PORT = process.env.PORT || 3005;

createServer().listen(PORT);
