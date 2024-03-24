import 'dotenv/config';
import { User } from './models/user.js';

User.sync({ force: true });
