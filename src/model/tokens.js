import { DataTypes } from 'sequelize';
import { sequelize } from '../db/connection.js';
import UserSchema from './user.js';

const TokensSchema = sequelize.define('tokens', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

TokensSchema.belongsTo(UserSchema);
UserSchema.hasMany(TokensSchema);

export default TokensSchema;
