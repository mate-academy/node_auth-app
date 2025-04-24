const { client } = require('./src/utils/db.js');
const { User } = require('./src/models/user.js');

await client.sync({
  force: true,
});
