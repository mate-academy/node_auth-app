/* eslint-disable no-console */
const app = require('./app');
const dotenv = require('dotenv');
const { sequelize } = require('./db');

require('./models/User');

dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Connected to PostgreSQL');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to DB:', error.message);
  }
})();
