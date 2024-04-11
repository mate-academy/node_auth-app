const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  database: 'login_app',
  username: 'postgres',
  password: '0105',
});

try {
  sequelize.authenticate();
} catch (error) {
  throw new Error(error);
}

module.exports = {
  sequelize,
};
