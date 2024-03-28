/* eslint-disable no-console */
'use strict';

require('dotenv/config');

const { sequelize } = require('./libs/db/database.js');
const { UserRoles } = require('./libs/enums/user-roles.js');

const { User } = require('./models/user.model.js');
const { Token } = require('./models/token.model.js');

require('./models/expense.model.js');

sequelize.sync({ force: true }).then(async() => {
  try {
    const adminUser = {
      username: 'admin',
      email: 'admin@admin.com',
      password: 'adminpassword',
      role: UserRoles.ADMIN,
    };

    const user = await User.create(adminUser);

    await Token.create({ userId: user.id });

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await sequelize.close();
  }
});
