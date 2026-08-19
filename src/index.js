require('dotenv').config();

const { app } = require('./app');
const { sequelize } = require('./config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(PORT);
  } catch {
    process.exit(1);
  }
};

startServer();
