// eslint-disable-next-line no-shadow
import type { Request, Response, NextFunction } from 'express';

export type Middleware = (req: Request, res: Response, next: NextFunction) => void;
export type RouteHandler = (req: Request, res: Response) => Promise<Response> | Promise<void>;
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

export interface Route {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
}

export interface InitProps<Controller> {
  controller: Controller;
  middlewares: Middleware[];
  routes: Route[];
}
