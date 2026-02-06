import http from 'http';
import { httpStatus } from '../static/index.ts';
import { RequestError } from '../errors/index.ts';

function errorHandler(res: http.ServerResponse, e: unknown) {
  res.setHeader('Content-Type', 'text/plain');

  if (e instanceof RequestError) {
    res.statusCode = e.statusCode;
    res.end(e.message);

    return;
  }

  res.statusCode = httpStatus.se;
  res.end('Unexpected server error');
}

export default errorHandler;
