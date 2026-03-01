import type { User } from "../../generated/prisma/client.ts";

export type RawUser = Omit<User, "id" | "activationToken">;

export type NormalizedUser = Pick<User, 'id'| 'name' | 'email'>;

export type UserPropsToUpdate = Partial<Omit<User, 'id' | 'activationToken'>>;

export type LoginData = Pick<User, 'email' | 'password'>;

export interface ErrorMessage {
  for?: string,
  message: string
}
export interface ErrorObject {
  errors: ErrorMessage[]
}

export class ApiError extends Error {
  status: number;
  errors: ErrorObject;

  constructor(message: string, status: number, errors: ErrorObject) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static badRequest(messages: ErrorMessage[]) {
    return new ApiError(
      'Bad request',
      400,
      { errors: messages}
    )
  }

  static authError(messages: ErrorMessage[]) {
    return new ApiError(
      'Unauthorized',
      401,
      { errors: messages}
    )
  }

  static accountAlreadyExist(messages: ErrorMessage[]) {
    return new ApiError('Conflict', 409, { errors: messages})
  }

  static notFound(messages: ErrorMessage[]) {
    return new ApiError('Not found', 404, { errors: messages});
  }
}

declare global {
  namespace Express {
    interface Request {
      normalizedUser?: NormalizedUser;
    }
  }
}
