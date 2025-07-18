'use strict';
import { Sequelize } from 'sequelize';
import utils from 'util';

import 'dotenv/config';
global.TextEncoder = utils.TextEncoder;

export const client = new Sequelize('postgres', 'postgres', '29052009', {
  host: 'localhost',
  dialect: 'postgres',
});
