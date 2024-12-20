const { config } = require('dotenv');
config();

const client = require('./src/utils/db.js');

client.sync({ force: true })
