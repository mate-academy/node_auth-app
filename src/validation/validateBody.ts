import { z } from 'zod';
import { RequestError } from '../errors/index.ts';
import { httpStatus } from '../static/index.ts';

function validateBody<T extends z.ZodSchema>(
  body: unknown,
  schema: T,
): z.infer<T> {
  try {
    return schema.parse(body);
  } catch (e) {
    if (e instanceof z.ZodError) {
      throw new RequestError(e.issues[0].message, httpStatus.br);
    }
    throw e;
  }
}

export default validateBody;
