import http from 'http';
import { RequestError } from '../errors/index.ts';
import { httpStatus, mthd, ep } from '../static/index.ts';
import type { Endpoint, Method } from '../static/types/index.ts';

const REQUIRED_PARAMS: Partial<Record<Endpoint, string>> = {
  [ep.act]: 'token',
};

const validatePath = (path: string): path is Endpoint => {
  return Object.values(ep).some((el) => el === path);
};

const validateMethod = (method: string | undefined): method is Method => {
  return Object.values(mthd).some((el) => el === method);
};

function validateRequest(req: http.IncomingMessage) {
  // check if URL
  if (!req.url) {
    throw new RequestError('Expected request URL', httpStatus.br);
  }

  const url = new URL(req.url, 'http://localhost');
  // validate endpoint
  const endpoint = url.pathname;

  if (!validatePath(endpoint)) {
    throw new RequestError('Not found', httpStatus.nf);
  }

  // validate method
  const method = req.method;

  if (!validateMethod(method)) {
    throw new RequestError(`Unknown method: ${method}`, httpStatus.br);
  }

  // check if ep requires searchparam
  if (!(endpoint in REQUIRED_PARAMS)) {
    return { endpoint, method, param: null };
  }

  const param = url.searchParams.get(REQUIRED_PARAMS[endpoint] as string);

  if (!param) {
    throw new RequestError('Missing required token parameter', httpStatus.br);
  }

  return { endpoint, method, param };
}

export default validateRequest;
