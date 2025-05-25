'use strict';

/* eslint-disable no-console */
import sequelize from '../config/db';
import User from './User';
import ActivationToken from './ActivationToken';
import PasswordReset from './PasswordReset';

// Define associations
User.hasMany(ActivationToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
ActivationToken.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(PasswordReset, { foreignKey: 'userId', onDelete: 'CASCADE' });
PasswordReset.belongsTo(User, { foreignKey: 'userId' });

const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL!');

    await sequelize.sync({ alter: true }); // Syncs DB schema based on models
    console.log('Database synced successfully!');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

initDB();

export { sequelize, User, ActivationToken, PasswordReset };
