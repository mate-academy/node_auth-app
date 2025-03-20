import 'dotenv/config';
import { sequelize } from "./src/utils/db.js";
import './src/models/User.js';
import './src/models/Token.js';

sequelize.sync({ force: true });