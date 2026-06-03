import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * URL for Prisma CLI / Studio.
 * Studio uses the `postgres` npm driver, which forwards query params to the server.
 * Strip params that only `pg` / Prisma 6 understand (`schema`, `uselibpqcompat`).
 */
function databaseUrlForPrismaTools(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error('DATABASE_URL is not set');
  }

  const url = new URL(raw);
  url.searchParams.delete('schema');
  url.searchParams.delete('uselibpqcompat');
  if (!url.searchParams.has('sslmode')) {
    url.searchParams.set('sslmode', 'require');
  }
  return url.toString();
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrlForPrismaTools(),
  },
});
