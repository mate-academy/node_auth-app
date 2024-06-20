/* eslint-disable no-unused-vars */
const { sequelize } = require('./utils/usersDB');
const { User } = require('./models/user.model/user.postgresql');
const { Token } = require('./models/token.model/token.postgresql');

sequelize.sync({ force: true });
