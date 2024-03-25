import 'dotenv/config';
import { Token } from './models/Token.js';

Token.sync({ force: true });
