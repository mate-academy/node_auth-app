require('dotenv').config();

const { client } = require('./src/utils/db');

client.sync({ force: true })
  .then(() => {
    console.log('Database synced!');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });
