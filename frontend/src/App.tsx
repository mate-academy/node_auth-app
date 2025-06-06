import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import 'animate.css';
import './styles.scss';

import { useAuth } from './components/AuthContext';
import { Loader } from './components/Loader/Loader';
import { StartPage } from './pages/StartPage';
import { RegistrationPage } from './pages/RegistrationPage/';
import { AccountActivationPage } from './pages/AccountActivationPage';
import { LoginPage } from './pages/LoginPage';
import { RequireAuth } from './components/RequireAuth';
import { PasswordResetPage } from './pages/PasswordResetPage';
import { PasswordResetConfirmationPage } from './pages/PasswordResetConfirmationPage';
import { ProfilePage } from './pages/ProfilePage';
import { FooterNav } from './components/FooterNav';
import { SearchPage } from './pages/SearchPage';
import { HomePage } from './pages/HomePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { TermsPage } from './pages/TermsPage';
import { GoogleSuccessPage } from './pages/GoogleSuccessPage';
import { GithubSuccessPage } from './pages/GithubSuccessPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  const { isChecked, currentUser, checkAuth } = useAuth();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    checkAuth();
  }, []);

  if (!isChecked) {
    return <Loader />;
  }

  return (
    <>
      <main>
        <div className='background'>
          <img src='/background_home.jpg' className='backgroundImg' />
          <div className='overlay'></div>
        </div>

        <section className='container'>
          <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="sign-up" element={<RegistrationPage />} />
            <Route
              path="activation/:activationToken"
              element={<AccountActivationPage />}
            />
            <Route
              path="google-success/:accessToken"
              element={<GoogleSuccessPage />}
            />
            <Route
              path="github-success/:accessToken"
              element={<GithubSuccessPage />}
            />

            <Route path="login" element={<LoginPage />} />

            <Route path="/" element={<RequireAuth />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route path="/password-reset" element={<PasswordResetPage />} />
            <Route
              path="/password-reset/:token"
              element={<PasswordResetConfirmationPage />}
            />

            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </section>
      </main>

      {currentUser && <FooterNav />}
    </>
  );
}
