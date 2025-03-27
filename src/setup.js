import 'dotenv/config';
import { sequelize } from './utils/db';
import './models/User';
import './models/Token';

sequelize.sync({ force: true });
