import dto from '../dto/index.ts';
import { RequestError } from '../errors/index.ts';
import { mailTemplate } from '../services/email/email.const.ts';
import srv from '../services/index.ts';
import { httpStatus, TKN, sch } from '../static/index.ts';
import { type Ctx } from '../static/types/index.ts';
import utl from '../utils/index.ts';
import { hashPwd } from './helpers/helpers.ts';

async function requestReset(ctx: Ctx<typeof sch.pwdReq>) {
  const { res, body } = ctx;
  const { email } = body;

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');

  res.end(
    JSON.stringify({
      message: 'Check your inbox for password reset link.',
    }),
  );

  try {
    const user = await srv.usr.gbEm(email);

    await srv.tkn.dltBUID(user.id, TKN.PWR);

    const { token, expiresAt } = utl.jwt.sign(dto.usr(user), TKN.PWR);

    const createPl = {
      userId: user.id,
      token: token,
      type: TKN.PWR,
      expiresAt: expiresAt,
    };

    const mail = await srv.eml.sdTM(user.email, token, mailTemplate.res);

    if (mail) {
      await srv.tkn.crt(createPl);
    }
  } catch (e) {
    if (e instanceof RequestError && e.statusCode === httpStatus.nf) {
      // eslint-disable-next-line no-console
      console.warn('UID was not found');
    } else {
      throw e;
    }
  }
}

async function processReset(ctx: Ctx<typeof sch.pwdRes>) {
  const { res, body } = ctx;
  const { token, newPwd } = body;

  const { type, ...payload } = utl.jwt.ver(token);

  if (type !== TKN.PWR) {
    throw new RequestError('Invalid token type', httpStatus.br);
  }

  const dbToken = await srv.tkn.gBTkn(token);

  if (dbToken.userId !== payload.id) {
    throw new RequestError('Token mismatch', httpStatus.br);
  }

  const hashedPwd = await hashPwd(newPwd);

  await srv.usr.ptch(payload.id, { password: hashedPwd });

  await srv.tkn.dlt(dbToken.id);

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');

  res.end(
    JSON.stringify({
      message: 'Password reset successfully. You can now login.',
    }),
  );
}

const rst = {
  req: requestReset,
  prc: processReset,
};

export default rst;
