import type { RequestHandler } from 'express';
import type { ParamsDictionary, Query } from 'express-serve-static-core';

export const asyncHandler = <
  Params extends ParamsDictionary = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends Query = Query,
>(
  handler: RequestHandler<Params, ResBody, ReqBody, ReqQuery>,
): RequestHandler<Params, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
