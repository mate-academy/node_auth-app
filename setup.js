require('dotenv/config');
const { client } = require('./src/utils/db.js');

require('./src/models/models.js');

(async () => {
  await client.sync({ force: true });
  await client.close();
})();
