import React, { useContext, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { AppContext } from "./context/AppContext";
import { ToastContainer } from "react-toastify";
import Header from "./components/Header";
import StartPage from "./pages/StartPage";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import RequireAuth from "./components/RequireAuth";
import UsersPage from "./pages/UsersPage";
import RegistrationPage from "./pages/RegistrationPage";
import RulesAndPolicy from "./components/RulesAndPolicy";
import AccountActivationPage from "./pages/AccountActivationPage";
import NotFoundPage from "./pages/NotFoundPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ClaimPasswordResetPage from "./pages/ClaimPasswordResetPage";
import Loader from "./components/Loader";
import "react-toastify/dist/ReactToastify.css";
import "./styles.scss";

function App() {
  const { isChecked, user, checkAuth } = useContext(AppContext);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="App">
      {!isChecked ? (
        <Loader />
      ) : (
        <>
          <ToastContainer />

          <Header addClasses={"App-Header"} />

          <Routes>
            <Route path="/" element={<StartPage />} />

            <Route path="login" element={<Login />} />

            <Route
              path="rulesandpolicy"
              element={<RulesAndPolicy addClasses={"App-RulesAndPolicy"} />}
            />

            <Route
              path="register"
              element={<RegistrationPage addClasses={"App-Screen"} />}
            />

            <Route
              path="activate/*"
              element={<AccountActivationPage addClasses={"App-Screen"} />}
            />

            <Route
              path="claimReset"
              element={<ClaimPasswordResetPage addClasses={"App-Screen"} />}
            />

            <Route
              path="resetpassword"
              element={<ResetPasswordPage addClasses={"App-Screen"} />}
            />

            <Route path="/" element={<RequireAuth />}>
              <Route path="login" element={<Profile />} />

              <Route
                path="users"
                element={<UsersPage addClasses={"App-Screen"} />}
              />

              <Route
                path="profile"
                element={<Profile addClasses={"App-Screen"} />}
              />
            </Route>

            <Route
              path="*"
              element={<NotFoundPage addClasses={"App-Screen"} />}
            />
          </Routes>
        </>
      )}
    </div>
  );
}

export default App;
