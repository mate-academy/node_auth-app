'use strict';

require('dotenv').config();

const { app } = require('./app.js');

const PORT = process.env.PORT || 3000;

app.listen(PORT);
