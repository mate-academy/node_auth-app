import type { Middleware } from '../modules/Router/Router.types.js';

export function requestPayload(): Middleware {
  return (request, response, next) => {
    // payload is not defined in default Express Request,
    // @ts-expect-error and this root middleware is adding it
    request.payload = request.payload ?? {};
    next();
  };
}
