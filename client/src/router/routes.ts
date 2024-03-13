export const routes = {
  home: "/home",
  signIn: "/sign-in",
  signUp: "/sign-up",
  resetPassword: "/password-reset",
  users: "/users",
  activate: {
    root: "/activate/*",
    rootTabs: "/activate/:activationToken",
  },
};
