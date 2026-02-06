import ctr from '../controllers/index.ts';
import { RequestError } from '../errors/index.ts';
import { ep, httpStatus, mthd, sch } from '../static/index.ts';
import type { Schema, Ctx, Endpoint, Method } from '../static/types/index.ts';

type Entr<S extends Schema | null> = {
  auth: boolean;
  schema: S;
  ctr: (args: Ctx<S>) => void | Promise<void>;
};

const routeMap = {
  [ep.idx]: {
    [mthd.get]: { auth: false, schema: null, ctr: ctr.idx },
  },
  [ep.auth]: {
    [mthd.post]: { auth: false, schema: sch.auth, ctr: ctr.auth.man },
  },
  [ep.refr]: {
    [mthd.post]: { auth: false, schema: null, ctr: ctr.auth.rfr },
  },
  [ep.lgt]: {
    [mthd.patch]: { auth: true, schema: null, ctr: ctr.auth.lgt },
  },
  [ep.reg]: {
    [mthd.post]: { auth: false, schema: sch.reg, ctr: ctr.reg.reg },
  },
  [ep.act]: {
    [mthd.get]: { auth: false, schema: null, ctr: ctr.reg.act },
  },
  [ep.prf]: {
    [mthd.get]: { auth: true, schema: null, ctr: ctr.acc.get },
    [mthd.del]: { auth: true, schema: null, ctr: ctr.acc.del },
    [mthd.patch]: { auth: true, schema: sch.upd, ctr: ctr.acc.patch },
  },
  [ep.pwc]: {
    [mthd.patch]: { auth: true, schema: sch.pwdUpd, ctr: ctr.acc.pwd },
  },
  [ep.pwrr]: {
    [mthd.post]: { auth: false, schema: sch.pwdReq, ctr: ctr.res.req },
  },
  [ep.pwrc]: {
    [mthd.post]: { auth: false, schema: sch.pwdRes, ctr: ctr.res.prc },
  },
} as const;

const getRouteConfig = <S extends Schema | null>(
  e: Endpoint,
  m: Method,
): Entr<S> => {
  const epRoutes = routeMap[e];
  const conf = epRoutes[m as keyof typeof epRoutes];

  if (!conf) {
    throw new RequestError(
      `Method ${m} is not supported for ${e} endpoint`,
      httpStatus.na,
    );
  }

  return conf;
};

export default getRouteConfig;
