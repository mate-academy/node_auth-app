/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
require('dotenv').config();

const { Token } = require('./models/Token.js');
const { User } = require('./models/User.js');
const { dbClient } = require('./utils/db');

dbClient
  .sync({ force: true })
  .then(() => {
    console.log('Database sync successful');
  })
  .catch((err) => {
    console.error('Error sync database:', err);
  });
