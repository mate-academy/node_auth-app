/* eslint-disable no-unused-vars */
'use strict';

const { client } = require('./utils/db');
const { User } = require('./models/User');
const { Token } = require('./models/Token');
const { Expense } = require('./models/Expense');
const { Category } = require('./models/Category');
const { Account } = require('./models/Account');

require('dotenv').config();

client.sync({ force: true });
