const { User } = require('./User.model.js');
const { Token } = require('./Token.model.js');

User.hasOne(Token, { onDelete: 'CASCADE' });
Token.belongsTo(User);

module.exports = { User, Token };
