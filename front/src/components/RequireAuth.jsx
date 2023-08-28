import { Navigate, Outlet, useLocation } from "react-router-dom";
import React, { useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";
import Loader from "./Loader.jsx";
import NotActivatedUser from "../pages/NotActivatedUser.jsx";

const RequireAuth = ({ children }) => {
  const { isChecked, user, isActivated } = useContext(AppContext);
  const location = useLocation();

  if (!isChecked) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isActivated) {
    return <NotActivatedUser addClasses={"App-Screen"} />;
  }

  return children || <Outlet />;
};

export default RequireAuth;
