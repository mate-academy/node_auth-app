import { Sequelize } from 'sequelize';

export const client = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: 'postgres',
});

try {
  await client.authenticate();
  console.log('✅ Database connected');
} catch (error) {
  console.error('❌ Database connection error:', error);
}
