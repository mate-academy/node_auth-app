const { PrismaClient } = require('../../prisma/.prisma/client/default');
const db = new PrismaClient();

module.exports = { db };
