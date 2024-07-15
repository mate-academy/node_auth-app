import { User } from './src/models/user.js';
import { Token } from './src/models/token.js';
import { client } from './src/utils/db.js';
await client
  .sync({ force: true })
  .then(() => {
    console.log('User table created successfully.');
  })
  .catch((error) => {
    console.error('Error creating User table:', error);
  });
