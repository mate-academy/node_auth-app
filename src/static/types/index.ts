import http from 'http';
import { z } from 'zod';

import type { DBUser, DTOUser, PatchUser, CreateUser } from './user.types.ts';
import type { DBToken, CreateTKN } from './token.types.ts';
import type { Tokens, Tnames, Fnames } from '../vocab/dbVocab.ts';
import type { Method, HTTPStatus } from '../vocab/httpVocab.ts';
import type { Schema } from '../bodySchemas.ts';
import type { Endpoint } from '../endpoints.ts';
import type { DBRes, Create } from './maps.type.ts';

type Ctx<S> = {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  body: S extends z.ZodSchema ? z.infer<S> : null;
  usr: DTOUser | null;
  param: string | null;
};

export type {
  DBUser,
  DTOUser,
  PatchUser,
  CreateUser,
  DBToken,
  CreateTKN,
  Ctx,
  Tokens,
  Tnames,
  Method,
  HTTPStatus,
  Schema,
  Endpoint,
  DBRes,
  Create,
  Fnames,
};
