export const routes = {
  home: "/home",
  signIn: "/sign-in",
  signUp: "/sign-up",
  resetPassword: {
    main: "/reset-password",
    root: "/reset-password/*",
    rootTabs: "/reset-password/:resetPasswordToken",
  },
  users: "/users",
  activate: {
    root: "/activate/*",
    rootTabs: "/activate/:activationToken",
  },
};
