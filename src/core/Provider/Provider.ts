export type Provider<
  Service,
  Controller = undefined,
> = Controller extends undefined
  ? { service: Service; controller?: never }
  : { service: Service; controller: Controller };
