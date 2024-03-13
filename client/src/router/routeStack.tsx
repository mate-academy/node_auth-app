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

export const routeStack: RouteObject[] = [
  createRoute("*", <Navigate to={routes.login.signIn} />),
  createRoute(routes.login.signIn, <SignIn />, "public"),
  createRoute(routes.login.signUp, <SignUp />, "public"),
  createRoute(routes.login.resetPassword, <ResetPassword />, "public"),
  createRoute(routes.home, <Home />),
  createRoute(routes.users, <Users />),
];
