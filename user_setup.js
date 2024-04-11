const { sequelize } = require('./src/utils/db');
const { User } = require('./src/models/user.model.js');
const { Token } = require('./src/models/token.model.js');
const { ResetToken } = require('./src/models/resetToken.model.js');

(async () => {
  await sequelize.sync({ force: true });
})();
