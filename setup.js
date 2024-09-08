require('dotenv').config();

const { Token } = require('./src/models/token.model.js');
const { PasswordToken } = require('./src/models/passwordToken.model.js');
const { User } = require('./src/models/user.model.js');
const { client } = require('./src/utils/db.js');

client.sync({ force: true });
