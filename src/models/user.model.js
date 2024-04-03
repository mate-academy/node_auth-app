const { sequelize } = require('../utils/db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  activation_token: {
    type: DataTypes.TEXT,
  },
});

(async () => {
  await sequelize.sync({ force: true });
})();

module.exports = {
  User,
};
