'use strict';

import { sequelize } from './utils/db';

import 'dotenv/config';
import './models/User';
import './models/Token';


sequelize.sync({ force:true });
