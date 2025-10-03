/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

db.user
  .create({
    data: {
      email: 'test123@email.com',
      password: 'abc',
      isActive: false,
      activationToken: 'xxx',
    },
  })
  .then(console.log)
  .catch(console.error)
  .finally(() => db.$disconnect());
