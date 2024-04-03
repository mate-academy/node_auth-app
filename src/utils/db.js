const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  database: 'login_app',
  username: 'postgres',
  password: '0105',
});

async function init() {
  try {
    await sequelize.authenticate();
    // console.log('Connection has been established successfully.');
  } catch (error) {
    // console.error('Unable to connect to the database:', error);
  }
}

init();

module.exports = {
  sequelize,
};
