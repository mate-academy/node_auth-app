'use strict';

const { User } = require("./src/models/User");

User.sync({ force: true });
