import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Loader } from "./Loader/Loader";
import { Navigate, Outlet } from "react-router-dom";

export const RequireNonAuth = () => {
  const { isChecked, user } = useContext(AuthContext);

  if (!isChecked) {
    return <Loader />
  }

  if (user) {
    return <Navigate to='/profile/details' replace />
  }

  return <Outlet />;
}