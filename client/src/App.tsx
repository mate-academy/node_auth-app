import { Routes, Route, Navigate } from 'react-router-dom';
import { Earth } from './components/Earth';
import { Starfield } from './components/Starfield';
import { RegisterPage } from './pages/RegisterPage';
// import { NotFoundPage } from './pages/NotFoundPage';
import { ActivatePage } from './pages/ActivatePage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';

export const App = () => {
  return (
    <div>
      <Starfield />
      <Earth />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/activate/:activationToken" element={<ActivatePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </div>
  );
};
