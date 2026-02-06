const TNAMES = {
  USR: 'users',
  TKN: 'tokens',
} as const;

type Tnames = (typeof TNAMES)[keyof typeof TNAMES];

const fnames = {
  [TNAMES.USR]: {
    id: 'id',
    name: 'name',
    email: 'email',
    pwd: 'password',
    act: 'activated',
  },
  [TNAMES.TKN]: {
    id: 'id',
    usr: 'userId',
    token: 'token',
    type: 'type',
    exp: 'expiresAt',
  },
} as const;

const TKN = {
  ACT: 'activation',
  RFR: 'refresh',
  PWR: 'password_reset',
  ACC: 'access',
} as const;

type Fnames<T extends Tnames> = (typeof fnames)[T][keyof (typeof fnames)[T]];
type Tokens = (typeof TKN)[keyof typeof TKN];

export { TNAMES, fnames, TKN };
export type { Tokens, Tnames, Fnames };
