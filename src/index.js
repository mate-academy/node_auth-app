import 'dotenv/config';
import { createServer } from './createServer.js';
import { sequelize } from './utils/db.js';

const PORT = process.env.PORT || 5000;

const app = createServer();

try {
  await sequelize.authenticate();

  // eslint-disable-next-line no-console
  console.log('db is running');

  app.listen(PORT, (error) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(`${error}`);

      return;
    }

    // eslint-disable-next-line no-console
    console.log(`server is running on ${PORT}`);
  });
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('DB connection failed:', error.message);
}
