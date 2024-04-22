const { Token } = require('./models/Token.model');
const { User } = require('./models/User.model');

User.sync({ force: true });
Token.sync({ force: true });
