import dotenv from 'dotenv';
import { app } from './app.js';
import sequelize from './config/database.js';
import { verifyEmailTransport } from './services/emailService.js';

dotenv.config();

const PORT = process.env.PORT || 3002;

async function start() {
  try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log('DB connected');
    await sequelize.sync();
    await verifyEmailTransport();

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
