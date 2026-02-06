import { TNAMES } from '../vocab/dbVocab.ts';
import { CreateTKN, DBToken } from './token.types.ts';
import { CreateUser, DBUser } from './user.types.ts';

type DBRes = {
  [TNAMES.USR]: DBUser;
  [TNAMES.TKN]: DBToken;
};

type Create = {
  [TNAMES.USR]: CreateUser;
  [TNAMES.TKN]: CreateTKN;
};

export type { DBRes, Create };
