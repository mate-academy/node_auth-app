import configs from '../configs/index.config.js';
import Auth from './Auth.model.js';
import User from './User.model.js';

User.hasMany(Auth, { foreignKey: 'userId' });
Auth.belongsTo(User, { foreignKey: 'userId' });

configs.sequelize.model.User = User;
configs.sequelize.model.Auth = Auth;

const models = {
  user: User,
  auth: Auth,
};

export default models;
