const { User } = require('./src/models/User.model');

User.sync({
  force: true,
});
