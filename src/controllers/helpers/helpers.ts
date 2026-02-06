import http from 'http';
import bcrypt from 'bcrypt';
import srv from '../../services/index.ts';
import { TKN, TOKEN_EXPIRY } from '../../static/index.ts';
import type { DTOUser } from '../../static/types/index.ts';
import utl from '../../utils/index.ts';

const SALT_ROUNDS = 10;

const ckNms = {
  [TKN.ACC]: 'access_token',
  [TKN.RFR]: 'refresh_token',
};

const setTkn = (t: typeof TKN.ACC | typeof TKN.RFR, s: string, age: string) =>
  `${ckNms[t]}=${s}; HttpOnly; Path=/; Max-Age=${age}; SameSite=Strict`;

const verifyPwd = async (pwdhash: string, pwd: string): Promise<boolean> => {
  return bcrypt.compare(pwdhash, pwd);
};

const hashPwd = async (pwd: string) => {
  return bcrypt.hash(pwd, SALT_ROUNDS);
};

async function handleTokens(res: http.ServerResponse, pl: DTOUser) {
  const accTkn = utl.jwt.create[TKN.ACC](pl);
  const refTkn = utl.jwt.create[TKN.RFR](pl);

  const createPayload = {
    userId: pl.id,
    token: refTkn.token,
    type: TKN.RFR,
    expiresAt: refTkn.expiresAt,
  };

  await srv.tkn.crt(createPayload);

  res.setHeader('Set-Cookie', [
    setTkn(TKN.ACC, accTkn.token, TOKEN_EXPIRY[TKN.ACC][1]),
    setTkn(TKN.RFR, refTkn.token, TOKEN_EXPIRY[TKN.RFR][1]),
  ]);
}

export { ckNms, setTkn, verifyPwd, hashPwd, handleTokens };
