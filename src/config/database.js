const { Sequelize } = require('sequelize');

export const sequelize = new Sequelize('postgres', 'login', '123123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
  define: {
    timestamps: true,
    underscored: false,
  },
});
