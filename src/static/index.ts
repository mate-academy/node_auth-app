import { ep } from './endpoints.ts';
import { TNAMES, fnames, TKN } from './vocab/dbVocab.ts';
import { mthd, httpStatus } from './vocab/httpVocab.ts';
import { sch } from './bodySchemas.ts';
import type { Tokens } from './types/index.ts';

const TOKEN_EXPIRY: Record<Tokens, [string, string]> = {
  [TKN.ACC]: ['15m', '900'],
  [TKN.RFR]: ['7d', '604800'],
  [TKN.ACT]: ['24h', '86400'],
  [TKN.PWR]: ['1h', '3600'],
};

export { TNAMES, TKN, fnames, TOKEN_EXPIRY, mthd, httpStatus, ep, sch };
