const { Room } = require('../models/rooms.model');
const { Message } = require('../models/messages.model');
const { Token } = require('../models/token.model');
const { User } = require('../models/users.model');

Room.hasMany(Message, {
  foreignKey: 'roomId',
  onDelete: 'CASCADE',
});

Message.belongsTo(Room, {
  foreignKey: 'roomId',
});

User.hasOne(Token, {
  foreignKey: 'userId',
});

Token.belongsTo(User, {
  foreignKey: 'userId',
});

Message.belongsTo(User, {
  foreignKey: 'userId',
});

User.hasMany(Message, {
  foreignKey: 'userId',
});

Room.belongsTo(User, {
  foreignKey: 'userId',
});

User.hasMany(Room, {
  foreignKey: 'userId',
});
