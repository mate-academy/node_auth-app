const ep = {
  idx: '/',
  auth: '/auth',
  refr: '/auth/refresh',
  lgt: '/auth/logout',
  reg: '/register',
  act: '/register/activate',
  prf: '/profile',
  pwc: '/profile/password',
  pwrr: '/password/reset-request',
  pwrc: '/password/reset',
} as const;

type Endpoint = (typeof ep)[keyof typeof ep];

export { ep, type Endpoint };
