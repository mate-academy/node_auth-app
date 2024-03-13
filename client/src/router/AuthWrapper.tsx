import React, { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { routes } from "./routes";
import { useAuthContext } from "../context/AuthProvider";

type Props = {
  children: ReactElement;
  type: string;
};

const AuthWrapper: React.FC<Props> = ({ children, type }) => {
  const { user } = useAuthContext();

  switch (type) {
    case "public":
      return user ? <Navigate to={routes.home} /> : children;

    case "private":
      return user ? children : <Navigate to={routes.login.signIn} />;

    default:
      return children;
  }
};

export default AuthWrapper;
