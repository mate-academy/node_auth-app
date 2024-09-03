require('./src/models/Token.model');
require('./src/models/User.model');

const { client } = require('./src/utils/db');

client.sync({ force: true });
