import type { AuthRoutes } from '../Auth/Auth.routes.js';

export interface ConfirmationEmailOptionsServerRedirect {
  email: string;
  token: string;
  route: AuthRoutes;
  getHTML: (link: string) => string;
  redirect?: string;
}

export interface ConfirmationEmailOptionsCustomRedirect {
  email: string;
  token: string;
  baseUrl: string;
  getHTML: (link: string) => string;
}

export type ConfirmationEmailOptions =
  | ConfirmationEmailOptionsServerRedirect
  | ConfirmationEmailOptionsCustomRedirect;

export function isServerRedirect(
  options: ConfirmationEmailOptions,
): options is ConfirmationEmailOptionsServerRedirect {
  return 'route' in options;
}
