/* eslint-disable no-console */
import app from './app.js';
import 'dotenv/config';
import sequelize from './config/db.connection.js';

const PORT = process.env.PORT || 3000;
let server = null;
let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  try {
    await new Promise((resolve, reject) => {
      if (!server) {
        resolve();

        return;
      }

      server.close((err) => {
        if (err) {
          reject(err);

          return;
        }
        resolve();
      });
    });
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error({ signal, error });
    process.exit(1);
  }
};

const start = async () => {
  try {
    await sequelize.sync({ alter: true });

    server = app.listen(process.env.PORT, (err) => {
      if (err) {
        throw err;
      }
      console.log(`Server successfully started on PORT ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
