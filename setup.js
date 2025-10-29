import 'dotenv/config';
import { User } from './src/models/user.js';
import { client } from './src/utils/db.js';

client
  .sync({ force: true })
  .then(async () => {
    // eslint-disable-next-line no-console
    console.log('Database synchronized');
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Error synchronizing database:', err);
  });
