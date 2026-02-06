import http from 'http';
import { dbSetup } from './db/index.ts';
import val from './validation/index.ts';
import mw from './middleware/index.ts';
import grc from './router/index.ts';
import type { Ctx } from './static/types/index.ts';
import utl from './utils/index.ts';

export async function createServer() {
  await dbSetup();

  return http.createServer(async (req, res) => {
    utl.setCors(res);

    // Handle preflight OPTIONS
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();

      return;
    }

    try {
      // validate request
      const { endpoint, method, param } = val.req(req);

      // get route config from router
      const { auth, schema, ctr } = grc(endpoint, method);
      let usr = null;

      // check auth token if router auth === true
      if (auth) {
        usr = mw.tokenAuth(req);
      }

      // validating body by comparing to schema if router schema !== null
      const body = schema ? val.bd(await mw.parseB(req), schema) : null;

      // creating ctx for controller
      const ctx: Ctx<typeof schema> = {
        req,
        res,
        body,
        usr,
        param,
      };

      // executing controller fn with ctx payload
      await ctr(ctx);
    } catch (e) {
      mw.error(res, e);
    }
  });
}
