const { DataTypes } = require("sequelize");
const client = require("../utils/db");
const User = require("./user");

const Token = client.define("tokens", {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(User);
User.hasOne(Token);

module.exports = Token;
