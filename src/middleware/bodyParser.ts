import http from 'http';
import { RequestError } from '../errors/index.ts';
import { httpStatus } from '../static/index.ts';

const maxSizeLimit = 1048576;

async function parseBody(req: http.IncomingMessage, maxSize = maxSizeLimit) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    let settled = false;

    req.on('error', (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });

    req.on('data', (chunk) => {
      if (settled) {
        return;
      }

      size += chunk.length;

      if (size > maxSize && !settled) {
        settled = true;
        req.destroy();
        reject(new RequestError('Body max size exceeded', httpStatus.br));

        return;
      }

      data += chunk;
    });

    req.on('end', () => {
      if (settled) {
        return;
      }

      try {
        settled = true;

        const res = JSON.parse(data);

        resolve(res);
      } catch {
        if (!settled) {
          settled = true;
          reject(new RequestError('Expected JSON', httpStatus.br));
        }
      }
    });

    req.on('close', () => {
      if (!settled) {
        settled = true;
        reject(new RequestError('Request cancelled', httpStatus.br));
      }
    });
  });
}

export { parseBody };
