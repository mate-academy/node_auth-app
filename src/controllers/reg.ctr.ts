import dto from '../dto/index.ts';
import { RequestError } from '../errors/index.ts';
import { mailTemplate } from '../services/email/email.const.ts';
import srv from '../services/index.ts';
import { httpStatus, sch, TKN } from '../static/index.ts';
import type { Ctx } from '../static/types/index.ts';
import utl from '../utils/index.ts';

import { handleTokens, hashPwd } from './helpers/helpers.ts';

async function register(ctx: Ctx<typeof sch.reg>): Promise<void> {
  const { res, body } = ctx;
  const { name, email, password } = body;

  const exists = await srv.usr.exBEm(email);

  if (exists) {
    throw new RequestError(
      `User with email ${email} already exists`,
      httpStatus.br,
    );
  }

  const hashedPwd = await hashPwd(password);

  const newUsr = await srv.usr.crt({
    name,
    email,
    password: hashedPwd,
  });

  const { token, expiresAt } = utl.jwt.sign(dto.usr(newUsr), TKN.ACT);

  const createPL = {
    userId: newUsr.id,
    token: token,
    type: TKN.ACT,
    expiresAt: expiresAt,
  };

  const sent = await srv.eml.sdTM(email, token, mailTemplate.act);

  if (sent) {
    await srv.tkn.crt(createPL);
  }

  res.statusCode = httpStatus.cr;
  res.setHeader('Content-Type', 'application/json');

  res.end(
    JSON.stringify({
      message: 'User created. Check your email for activation link.',
      user: { id: newUsr.id, name, email },
    }),
  );
}

async function activate(ctx: Ctx<false>) {
  const { res, param } = ctx;

  const token = await srv.tkn.gBTkn(param as string);

  if (token.type !== TKN.ACT) {
    throw new RequestError('Invalid token type', httpStatus.br);
  }

  if (new Date(token.expiresAt) < new Date()) {
    throw new RequestError('Token expired', httpStatus.br);
  }

  const user = await srv.usr.ptch(token.userId, { activated: true });

  await srv.tkn.dlt(token.id);

  const payload = dto.usr(user);

  await handleTokens(res, payload);

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Activated', user: payload }));
}

const reg = {
  reg: register,
  act: activate,
};

export default reg;
