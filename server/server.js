import { sequelize } from './config/db.js';
import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;

const start = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  app.listen(PORT, () => {
    console.log(`Server started at ${PORT}`);
  });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
