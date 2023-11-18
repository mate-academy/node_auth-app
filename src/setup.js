"use strict";

const { User } = require("./models/User.js");
const { Token } = require("./models/Token.js");
const { sequelize } = require("./utils/db.js");

sequelize.sync({ force: true });
