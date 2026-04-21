const User = require('./User.model.js');
const Expense = require('./Expense.model.js');
const Token = require('./Token.model.js');
const SocialAccount = require('./SocialAccount.model.js');

User.hasMany(SocialAccount);
SocialAccount.belongsTo(User);

// Assuming these relations make sense given the foreign keys
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasOne(Token);
Token.belongsTo(User);

module.exports = {
  User,
  Expense,
  Token,
  SocialAccount,
};
