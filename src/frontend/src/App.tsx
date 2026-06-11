import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ActivationPage } from "./pages/ActivationPage";
import { PasswordResetPage } from "./pages/PasswordResetPage";
import { PasswordResetConfirmPage } from "./pages/PasswordResetConfirmPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/activation" element={<PublicRoute><ActivationPage /></PublicRoute>} />
        <Route path="/password-reset" element={<PublicRoute><PasswordResetPage /></PublicRoute>} />
        <Route path="/password-reset/confirm" element={<PublicRoute><PasswordResetConfirmPage /></PublicRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;