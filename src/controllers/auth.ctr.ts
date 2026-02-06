import bcrypt from 'bcrypt';
import { RequestError } from '../errors/index.ts';
import srv from '../services/index.ts';
import { httpStatus, TKN, sch } from '../static/index.ts';
import utl from '../utils/index.ts';
import type { Ctx } from '../static/types/index.ts';
import { ckNms, handleTokens, setTkn } from './helpers/helpers.ts';

async function manual(ctx: Ctx<typeof sch.auth>): Promise<void> {
  const { res, body } = ctx;
  const { email, password } = body;
  // check usr activation
  const user = await srv.usr.gbEm(email);

  if (!user.activated) {
    throw new RequestError(
      'Please activate your account before logging in',
      httpStatus.ua,
    );
  }

  // compare pw

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new RequestError('Invalid credentials', httpStatus.ua);
  }

  // create tkns

  const { id, name } = user;
  const payload = { id, name, email };

  await handleTokens(res, payload);

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Authorized', user: { id, name, email } }));
}

async function refresh(ctx: Ctx<false>) {
  const { req, res } = ctx;
  const cookies = utl.prsCks(req);
  const token = cookies[ckNms[TKN.RFR]];

  if (!token) {
    throw new RequestError('No token provided', httpStatus.ua);
  }

  const { type, ...pl } = utl.jwt.ver(token);

  if (type !== TKN.RFR) {
    throw new RequestError('Invalid token type', httpStatus.ua);
  }

  const dbTok = await srv.tkn.gBTkn(token);

  // delete token
  await srv.tkn.dlt(dbTok.id);

  await handleTokens(res, pl);

  // end res
  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Authorized', user: { ...pl } }));
}

async function logout(ctx: Ctx<false>) {
  const { req, res } = ctx;
  const cookies = utl.prsCks(req);

  const refToken = cookies[ckNms[TKN.RFR]];

  if (refToken) {
    try {
      const dbTok = await srv.tkn.gBTkn(refToken);

      await srv.tkn.dlt(dbTok.id);
    } catch {}
  }

  res.setHeader('Set-Cookie', [
    setTkn(TKN.ACC, '', '0'),
    setTkn(TKN.RFR, '', '0'),
  ]);

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Logged out' }));
}

const auth = {
  man: manual,
  rfr: refresh,
  lgt: logout,
};

export default auth;
