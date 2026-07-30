import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { SignPage } from './components/sign/signPage';
import './App.scss';
import { Homepage } from './components/homepage/home';
import { LoginPage } from './components/login/loginPage';
import { Activate } from './components/activatepage/activate';
import { Profile } from './components/profile/profile';
import { RecoverPage } from './components/recoverPassword/recoverPage';
import { ChangePassword } from './components/changePassword/changePassword';
import { NotFound } from './components/notFound/notFound';

export const App: React.FC = () => {
  return (
    <div className="App">
      <main>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/register" element={<SignPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/activate/:activationToken" element={<Activate />} />
          <Route path="/recover" element={<RecoverPage />} />
          <Route
            path="/recover/:activationToken"
            element={<ChangePassword />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};
