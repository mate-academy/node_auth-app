import client from './src/util/db.js';
import './src/models/User.model.js';
import './src/models/Token.model.js';

await client.sync({ force: true });

// eslint-disable-next-line no-console
console.log('Database synced');
process.exit(0);
