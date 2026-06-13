const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DB_URL || '';
const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

module.exports = {
  db,
};
