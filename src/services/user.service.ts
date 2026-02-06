import DB from '../model/index.ts';
import { fnames, httpStatus, TNAMES } from '../static/index.ts';
import { base, dbHandler } from './repo.service.ts';
import type { Create, PatchUser } from '../static/types/index.ts';
import { RequestError } from '../errors/index.ts';

async function patchUser(id: string, payload: Partial<PatchUser>) {
  const user = await base.get(TNAMES.USR, id);

  await DB[TNAMES.USR].update(payload, { where: { id } });

  return { ...user, ...payload };
}

const usr = {
  gbId: (id: string) => base.get(TNAMES.USR, id),
  gbEm: (e: string) => base.gBPrm(TNAMES.USR, fnames[TNAMES.USR].email, e),
  dlt: (id: string) => base.del(TNAMES.USR, id),
  crt: (data: Create[typeof TNAMES.USR]) => base.crt(TNAMES.USR, data),
  exBEm: async (email: string): Promise<boolean> => {
    try {
      await base.gBPrm(TNAMES.USR, fnames[TNAMES.USR].email, email);

      return true;
    } catch (e) {
      if (e instanceof RequestError && e.statusCode !== httpStatus.se) {
        return false;
      }
      throw e;
    }
  },
  ptch: dbHandler((id: string, pl: Partial<PatchUser>) => patchUser(id, pl)),
};

export default usr;
