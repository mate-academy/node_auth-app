/* eslint-disable no-console */
import sequelize from './services/database.js';
import { redisClient } from './services/cache.js';
import RootService from './core/root/Root.service.js';

async function setup() {
  console.log('Setting up...');

  const service = new RootService();

  console.log('Check services connection...');
  await service.start();
  console.log('All services are connected successfully');

  // database setup
  console.log('Setting up database...');
  await sequelize.sync({ force: true });
  console.log('Database setup completed');

  // cache setup
  console.log('Setting up cache...');
  await redisClient.flushAll();
  console.log('Cache setup completed');
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
setup().then(() => {
  console.log('Setup completed');
  process.exit(0);
});
