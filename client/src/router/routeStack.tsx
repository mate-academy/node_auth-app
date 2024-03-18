import React from "react";
import { ReactElement } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import AuthWrapper from "./AuthWrapper";
import { routes } from "./routes";
import SignIn from "../pages/SignIn";
import Home from "../pages/Home";
import SignUp from "../pages/SignUp";
import ResetPassword from "../pages/ResetPassword";
import Users from "../pages/Users";
import UserActivationPage from "../pages/UserActivationPage";
import EmailFormForPasswordReset from "../pages/EmailFormForPasswordReset";

function createRoute(
  path: string,
  component: ReactElement,
  type = "private"
): RouteObject {
  return {
    path,
    element: <AuthWrapper type={type}>{component}</AuthWrapper>,
  };
}

// приложение при перезагрузке постоянно ведет на логин - НЕ ок
// EmailFormForpassword... постоянно перезагружается после отправки формы
// страница активации пользователя (из-за этого текст не правильный) и users рендериться два раза

// ## (Optional) Advanced tasks
// - Implement Sign-up with Google, Facebook, Github (use Passport.js lib)
// - Profile page should allow to add/remove any social account
// - Add authentication to your Accounting App

export const routeStack: RouteObject[] = [
  createRoute("*", <Navigate to={routes.signIn} />),
  createRoute(routes.signIn, <SignIn />, "public"),
  createRoute(routes.signUp, <SignUp />, "public"),
  createRoute(
    routes.resetPassword.main,
    <EmailFormForPasswordReset />,
    "public"
  ),
  createRoute(routes.resetPassword.rootTabs, <ResetPassword />, "public"),
  createRoute(routes.activate.rootTabs, <UserActivationPage />, "public"),
  createRoute(routes.home, <Home />),
  createRoute(routes.users, <Users />),
];
