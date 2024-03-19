import { Router as ExpressRouter } from 'express';
import type { InitProps } from './Router.types.js';

export default class Router<Controller> {
  public readonly router: ExpressRouter;

  constructor({ controller, middlewares, routes }: InitProps<Controller>) {
    this.router = ExpressRouter();
    middlewares.forEach((middleware) => this.router.use(middleware));

    routes.forEach((route) => {
      const { method, path, handler } = route;

      this.router[method](path, (req, res, next) => {
        handler.call(controller, req, res).catch(next);
      });
    });
  }
}
