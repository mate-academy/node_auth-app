import User from './user.model.ts';
import Token from './token.model.ts';
import { TNAMES } from '../static/index.ts';

const DB = {
  [TNAMES.USR]: User,
  [TNAMES.TKN]: Token,
};

export default DB;
