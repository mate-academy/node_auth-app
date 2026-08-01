import { User } from './User.model.js';
import { Token } from './Token.model.js';

User.hasOne(Token, { onDelete: 'CASCADE' });
Token.belongsTo(User);

export { User, Token };
