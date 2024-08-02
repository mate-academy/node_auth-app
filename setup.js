import 'dotenv/config';
import { client } from './src/utils/db.js';
import { User } from './src/models/user.js';
import { Token } from './src/models/token.js';

client.sync({ alter: true })
  .then(() => {
    console.log('Database & tables synced');
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });