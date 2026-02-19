/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import 'dotenv/config';
import { client } from './src/utils/db.js';
import { User } from './src/models/User.js';
import { Token } from './src/models/Token.js';

/* // the imports are intentional to register model definitions
// with the Sequelize instance
*/

async function init() {
  try {
    await client.sync({ alter: true });
    console.log('Database tables were synchronized/updated!');

    await client.close();
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err);

    try {
      await client.close();
    } catch (closeErr) {
      console.error('Error while closing connection:', closeErr);
    }

    process.exit(1);
  }
}

init();
