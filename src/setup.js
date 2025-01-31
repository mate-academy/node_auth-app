import 'dotenv/config';
import { User } from './models/user.model.js';

User.sync({ force: true });
