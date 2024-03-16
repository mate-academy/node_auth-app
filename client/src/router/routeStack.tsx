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

// на клиенте ошибки черти как вылазят
// приложение при перезагрузке постоянно ведет на логин - НЕ ок
// страница активации пользователя и users рендериться два раза
// на сервере в токинах храняться старые айдишки пользователей (я обновила базу в sql)

// реализовать смену пароля для юзера

export const routeStack: RouteObject[] = [
  createRoute("*", <Navigate to={routes.signIn} />),
  createRoute(routes.signIn, <SignIn />, "public"),
  createRoute(routes.signUp, <SignUp />, "public"),
  createRoute(routes.resetPassword, <ResetPassword />, "public"),
  createRoute(routes.home, <Home />),
  createRoute(routes.activate.rootTabs, <UserActivationPage />, "public"),
  createRoute(routes.users, <Users />),
];
