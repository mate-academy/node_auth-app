import { Outlet } from 'react-router-dom';

import './Layout.css';

import { Header } from '../../components/Header/Header';
import { AuthUser } from '../../types/auth';

type Props = {
  authUser: AuthUser | null;
  onLogoutSuccess: () => void;
};

export const Layout = ({ authUser, onLogoutSuccess }: Props) => {
  return (
    <>
      <Header authUser={authUser} onLogoutSuccess={onLogoutSuccess} />
      <main>
        <Outlet />
      </main>
    </>
  );
};
