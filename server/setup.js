const client = require('./src/utils/db');
const User = require('./src/modules/user');

client
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

User.sync();

client.sync({ force: true }).then(() => {
  console.log("Drop and re-sync db.");
});
