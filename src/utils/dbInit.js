import { client } from './db.js';

export const dbInit = async () => {
  await client.authenticate();
  // eslint-disable-next-line no-console
  console.log('✅ Database connected');
  await client.sync();
  // eslint-disable-next-line no-console
  console.log('✅ Tables synced');
};
