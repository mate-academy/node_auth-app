import DB from '../model/index.ts';
import { TNAMES, fnames } from '../static/index.ts';
import { base } from './repo.service.ts';
import type { Create, Tokens } from '../static/types/index.ts';

const nms = fnames[TNAMES.TKN];

const tkn = {
  crt: (d: Create[typeof TNAMES.TKN]) => base.crt(TNAMES.TKN, d),
  gBTkn: (q: string) => base.gBPrm(TNAMES.TKN, fnames[TNAMES.TKN].token, q),
  dlt: (id: string) => base.del(TNAMES.TKN, id),
  dltBUID: async (userId: string, type?: Tokens) => {
    return DB[TNAMES.TKN].destroy({
      where: type
        ? { [nms.usr]: userId, [nms.type]: type }
        : { [nms.usr]: userId },
    });
  },
};

export default tkn;
