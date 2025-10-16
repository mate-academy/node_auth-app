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
    // eslint-disable-next-line no-console
    console.log('Connected to PostgreSQL');

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to connect to DB:', error.message);
  }
})();
