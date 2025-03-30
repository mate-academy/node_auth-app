import { ZodError } from 'zod';
import error from '../errors/index.error.js';

const asyncError = (err, _, res, __) => {
  if (err instanceof ZodError) {
    return error.zod(err, res);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).send({
      issue: ` ${err.message}`,
    });
  }

  if (err instanceof Error) {
    const status = err.status;

    return res.status(status).send({
      issue: err.message,
    });
  }

  res.status(500).send({
    issue: 'Internal server error',
  });
};

export default asyncError;
