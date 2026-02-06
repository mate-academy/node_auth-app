import { TKN } from '../index.ts';
import type { Tokens } from '../vocab/dbVocab.ts';

interface DBToken {
  id: string;
  userId: string;
  token: string;
  type: Tokens;
  expiresAt: Date;
  createdAt: Date;
}

interface CreateTKN extends Pick<DBToken, 'userId' | 'token'> {
  type: Exclude<Tokens, typeof TKN.ACC>;
  expiresAt: string;
}

export type { DBToken, CreateTKN };
