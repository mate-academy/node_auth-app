import { Route, BrowserRouter, Routes } from "react-router-dom";
import { App } from "./App";
import { LoginPage } from "./Pages/LoginPage";
import { RegistrationPage } from "./Pages/RegistrationPage";
import { RequireAuth } from "./components/RequireAuth";
import { ProfilePage } from "./Pages/ProfilePage";
import { ActivationPage } from "./Pages/ActivationPage";
import { RequireNonAuth } from "./components/RequireNonAuth";
import { ForgotPassPage } from "./Pages/ForgotPassPage";
import { ResetPassPage } from "./Pages/ResetPassPage";
import { ResetEmailPage } from "./Pages/ResetEmailPage/ResetEmailPage";
import { NotFoundPage } from "./Pages/NotFoundPage";

export const Root = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="/activate/:activationToken" element={<ActivationPage />} />
        <Route element={<RequireAuth />}>
          <Route path="profile/:item?" element={<ProfilePage />} />
        </Route>
        <Route element={<RequireNonAuth />}>
          <Route path="forgot-pass" element={<ForgotPassPage />} />
          <Route path="reset-password/:resetToken" element={<ResetPassPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="registration" element={<RegistrationPage />} />
        </Route>
        <Route path="change-email/:securityToken" element={<ResetEmailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
)