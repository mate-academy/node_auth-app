import dto from '../dto/index.ts';
import { RequestError } from '../errors/index.ts';
import { mailTemplate } from '../services/email/email.const.ts';
import srv from '../services/index.ts';
import { httpStatus, TKN, sch } from '../static/index.ts';
import type { Ctx, DTOUser } from '../static/types/index.ts';
import { hashPwd, setTkn, verifyPwd } from './helpers/helpers.ts';

async function getAccData(ctx: Ctx<false>) {
  const { res, usr } = ctx;

  const dbres = await srv.usr.gbId((usr as DTOUser).id);

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(dto.usr(dbres)));
}

async function deleteAcc(ctx: Ctx<false>) {
  const { res, usr } = ctx;

  await srv.usr.dlt((usr as DTOUser).id);

  res.setHeader('Set-Cookie', [
    setTkn(TKN.ACC, '', '0'),
    setTkn(TKN.RFR, '', '0'),
  ]);

  res.statusCode = httpStatus.nc;
  res.end();
}

async function patchAcc(ctx: Ctx<typeof sch.upd>) {
  const { res, body, usr } = ctx;
  const { password, email, name } = body;

  const user = await srv.usr.gbId((usr as DTOUser).id);

  const isValid = await verifyPwd(user.password, password);

  if (!isValid) {
    throw new RequestError('Invalid credentials', httpStatus.ua);
  }

  const payload: { name?: string; email?: string } = {};

  if (name) {
    payload.name = name;
  }

  if (email) {
    payload.email = email;
  }

  const newUsr = await srv.usr.ptch(user.id, payload);

  if (email && email !== user.email) {
    await srv.eml.sdTM(user.email, email, mailTemplate.emlChg);
  }

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(dto.usr(newUsr)));
}

async function changePass(ctx: Ctx<typeof sch.pwdUpd>) {
  const { res, body, usr } = ctx;
  const { oldPwd, newPwd } = body;

  const user = await srv.usr.gbId((usr as DTOUser).id);

  const isValid = await verifyPwd(user.password, oldPwd);

  if (!isValid) {
    throw new RequestError('Invalid credentials', httpStatus.ua);
  }

  const hashedPwd = await hashPwd(newPwd);

  await srv.usr.ptch(user.id, { password: hashedPwd });

  res.setHeader('Set-Cookie', [
    setTkn(TKN.ACC, '', '0'),
    setTkn(TKN.RFR, '', '0'),
  ]);

  res.setHeader('Content-Type', 'application/json');

  res.statusCode = httpStatus.ok;

  res.end(JSON.stringify({ message: 'Password changed successfully' }));
}

const acc = {
  get: getAccData,
  del: deleteAcc,
  patch: patchAcc,
  pwd: changePass,
};

export default acc;
