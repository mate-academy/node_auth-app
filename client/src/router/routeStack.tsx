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
// reset password page - сначала показывает что не прав страница, а потом ок
// reset password page - в нетворке беда в запросах

// вроде все гуд
// на сервере в токинах храняться старые айдишки пользователей (я обновила базу в sql)
// странно, что в базе данных не обновляется апдейтид после когда удаляю какой-то токен

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
