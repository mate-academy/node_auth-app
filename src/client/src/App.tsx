import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Loader } from './components/Loader';
import { Layout } from './modules/Layout';
import { HomePage } from './modules/HomePage';
import { NotFoundPage } from './modules/NotFoundPage';
import { ProfilePage } from './modules/ProfilePage';
import { AccountPage } from './modules/AccountPage';
import { AuthResponse, AuthUser } from './types/auth';
import { client } from './utils/client';
import { ActivationPage } from './modules/ActivationPage';
import { PasswordForgot } from './modules/PasswordForgot';
import { PasswordReset } from './modules/PasswordReset';
import { PasswordSuccess } from './modules/PasswordSuccess';

function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await client.get<AuthResponse>('/me');
        setAuthUser(response.data);
      } catch {
        setAuthUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  if (isAuthLoading) {
    return <Loader />;
  }

  return (
    <div className="App">
      <Routes>
        <Route
          element={
            <Layout
              authUser={authUser}
              onLogoutSuccess={() => {
                setAuthUser(null);
              }}
            />
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route
            path="profile"
            element={
              authUser ? (
                <ProfilePage
                  user={authUser}
                  onProfileUpdate={(user) => {
                    setAuthUser(user);
                  }}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="login"
            element={
              authUser ? (
                <Navigate to="profile" replace />
              ) : (
                <AccountPage
                  initialMode="login"
                  onLoginSuccess={(user) => {
                    setAuthUser(user);
                  }}
                />
              )
            }
          />
          <Route
            path="registration"
            element={
              authUser ? (
                <Navigate to="profile" replace />
              ) : (
                <AccountPage
                  initialMode="registration"
                  onLoginSuccess={(user) => {
                    setAuthUser(user);
                  }}
                />
              )
            }
          />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="activate/:token" element={<ActivationPage />} />

          <Route path="password-reset/request" element={<PasswordForgot />} />
          <Route
            path="password-reset/confirm/:token"
            element={<PasswordReset />}
          />

          <Route path="password-reset/success" element={<PasswordSuccess />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
