import 'dotenv/config';
import { User } from './models/user.model.js';
import { Token } from './models/token.model.js';

Token.sync({ force: true });
User.sync({ force: true });
