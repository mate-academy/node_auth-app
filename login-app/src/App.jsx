import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ActivationSent } from './pages/ActivationSent';
import { Activate } from './pages/Activate';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { ResetSuccess } from './pages/ResetSuccess';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<ProtectedRoute allowAuthenticated={false} />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/activation-sent" element={<ActivationSent />} />
            <Route path="/activate" element={<Activate />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password-confirm" element={<ResetPassword />} />
            <Route path="/reset-success" element={<ResetSuccess />} />
          </Route>

          <Route element={<ProtectedRoute allowAuthenticated={true} />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
