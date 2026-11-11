import { env } from './config/env';
import { app } from './app';
import { prisma } from './db';

async function start() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    // eslint-disable-next-line no-console
    console.log('✅ DB connected');

    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Unable to connect to DB:', error);
    process.exit(1);
  }
}

start();
