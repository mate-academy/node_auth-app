require('dotenv').config();
const { User } = require('./src/models/user.model.js');
const { client } = require('./src/utils/db.js');

client.sync({ force: true })

